import { create } from 'zustand';
import { Lesson, EvaluationResult, AvatarState, TeacherAnswer } from '../types';
import { teachingApi, lessonApi } from '../services/api';
import { speechService } from '../services/speechService';
import confetti from 'canvas-confetti';

export type PedagogicalStep = 'EXPLAIN' | 'DEMONSTRATE' | 'QUESTION' | 'EVALUATE' | 'ADAPT' | 'CONTINUE';

export interface ChatMessage {
  id: string;
  role: 'user' | 'teacher';
  text: string;
  analogy?: string;
  timestamp: string;
}

interface TeachingState {
  lesson: Lesson | null;
  currentSectionIndex: number;
  pedagogicalStep: PedagogicalStep;
  avatarState: AvatarState;
  isAudioEnabled: boolean;
  chatMessages: ChatMessage[];
  lastEvaluation: EvaluationResult | null;
  isEvaluating: boolean;
  isAsking: boolean;
  isListeningMic: boolean;

  setLesson: (lesson: Lesson) => void;
  setSectionIndex: (index: number) => void;
  setPedagogicalStep: (step: PedagogicalStep) => void;
  setAvatarEmotion: (emotion: AvatarState['emotion']) => void;
  setAvatarViseme: (viseme: AvatarState['viseme']) => void;
  toggleAudio: () => void;
  narrateText: (text: string, emotion?: AvatarState['emotion']) => void;
  stopNarration: () => void;
  startListeningMic: (onFinalTranscript: (text: string) => void) => void;
  stopListeningMic: () => void;
  submitAnswer: (questionId: number, answer: string) => Promise<EvaluationResult>;
  askDoubt: (query: string) => Promise<TeacherAnswer>;
  advanceSection: () => Promise<void>;
  selectConcept: (index: number) => Promise<void>;
  resumeLesson: () => Promise<void>;
}

export const useTeachingStore = create<TeachingState>((set, get) => ({
  lesson: null,
  currentSectionIndex: 0,
  pedagogicalStep: 'EXPLAIN',
  avatarState: {
    emotion: 'explaining',
    is_speaking: false,
    viseme: 'sil',
    gesture: 'nod',
  },
  isAudioEnabled: true,
  chatMessages: [],
  lastEvaluation: null,
  isEvaluating: false,
  isAsking: false,
  isListeningMic: false,

  setLesson: (lesson: Lesson) => {
    set({
      lesson,
      currentSectionIndex: lesson.current_section_index || 0,
      pedagogicalStep: 'EXPLAIN',
      lastEvaluation: null,
      chatMessages: [
        {
          id: 'welcome-msg',
          role: 'teacher',
          text: `Welcome! Today we are exploring "${lesson.title}". I'll guide you step-by-step, explain with analogies and dynamic models, and make sure you truly master every concept!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });

    // Auto-narrate welcome if audio is enabled
    const sec = lesson.sections[0];
    const script = sec?.narration_script || sec?.explanation_text || `Welcome to ${lesson.title}`;
    get().narrateText(script, 'explaining');
  },

  setSectionIndex: (index: number) => {
    const { lesson } = get();
    if (!lesson || index < 0 || index >= lesson.sections.length) return;
    set({
      currentSectionIndex: index,
      pedagogicalStep: 'EXPLAIN',
      lastEvaluation: null,
    });
    const sec = lesson.sections[index];
    if (sec) {
      const script = sec.narration_script || sec.explanation_text;
      get().narrateText(script, 'explaining');
    }
  },

  setPedagogicalStep: (step: PedagogicalStep) => {
    set({ pedagogicalStep: step });
    if (step === 'DEMONSTRATE') {
      get().narrateText(
        'Take a look at the interactive demonstrator on the board. Notice how adjusting voltage and resistance impacts the electron current in real time.',
        'explaining'
      );
    } else if (step === 'QUESTION') {
      get().narrateText(
        'Now let us test your understanding with a diagnostic checkpoint question. Select your answer when ready!',
        'encouraging'
      );
    }
  },

  setAvatarEmotion: (emotion: AvatarState['emotion']) => {
    set((state) => ({
      avatarState: { ...state.avatarState, emotion },
    }));
  },

  setAvatarViseme: (viseme: AvatarState['viseme']) => {
    set((state) => ({
      avatarState: { ...state.avatarState, viseme },
    }));
  },

  toggleAudio: () => {
    const newState = !get().isAudioEnabled;
    set({ isAudioEnabled: newState });
    if (!newState) {
      speechService.stop();
      set((state) => ({
        avatarState: { ...state.avatarState, is_speaking: false, viseme: 'sil' },
      }));
    }
  },

  narrateText: (text: string, emotion: AvatarState['emotion'] = 'explaining') => {
    const { isAudioEnabled } = get();
    if (!isAudioEnabled) {
      set((state) => ({
        avatarState: { ...state.avatarState, emotion, is_speaking: false, viseme: 'sil' },
      }));
      return;
    }

    speechService.speak(text, {
      onStart: () => {
        set((state) => ({
          avatarState: { ...state.avatarState, emotion, is_speaking: true },
        }));
      },
      onViseme: (viseme) => {
        set((state) => ({
          avatarState: { ...state.avatarState, viseme },
        }));
      },
      onEnd: () => {
        set((state) => ({
          avatarState: { ...state.avatarState, is_speaking: false, viseme: 'sil' },
        }));
      },
      onError: () => {
        set((state) => ({
          avatarState: { ...state.avatarState, is_speaking: false, viseme: 'sil' },
        }));
      },
    });
  },

  stopNarration: () => {
    speechService.stop();
    set((state) => ({
      avatarState: { ...state.avatarState, is_speaking: false, viseme: 'sil' },
    }));
  },

  startListeningMic: (onFinalTranscript: (text: string) => void) => {
    set({ isListeningMic: true });
    get().setAvatarEmotion('listening');
    speechService.startListening(
      (transcript, isFinal) => {
        if (isFinal) {
          set({ isListeningMic: false });
          onFinalTranscript(transcript);
        }
      },
      () => {
        set({ isListeningMic: false });
        get().setAvatarEmotion('explaining');
      }
    );
  },

  stopListeningMic: () => {
    speechService.stopListening();
    set({ isListeningMic: false });
    get().setAvatarEmotion('explaining');
  },

  submitAnswer: async (questionId: number, answer: string): Promise<EvaluationResult> => {
    set({ isEvaluating: true });
    try {
      const evaluation = await teachingApi.submitAnswer(questionId, answer);
      set({ lastEvaluation: evaluation, isEvaluating: false });

      if (evaluation.is_correct) {
        set({ pedagogicalStep: 'CONTINUE' });
        get().setAvatarEmotion('celebratory');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0c8ce9', '#00dfd8', '#7928ca', '#f5a623'],
        });

        get().narrateText(
          evaluation.ai_feedback || 'Brilliant work! That is completely correct. You grasped the relationship seamlessly.',
          'celebratory'
        );
      } else {
        set({ pedagogicalStep: 'ADAPT' });
        get().setAvatarEmotion('encouraging');

        const remedialMsg = evaluation.remedial_analogy
          ? `${evaluation.ai_feedback} Here is an intuitive way to think about it: ${evaluation.remedial_analogy}`
          : evaluation.ai_feedback;

        get().narrateText(remedialMsg, 'encouraging');
      }

      // Update local lesson mastery
      set((state) => {
        if (!state.lesson) return state;
        return {
          lesson: {
            ...state.lesson,
            current_mastery: evaluation.updated_mastery,
          },
        };
      });

      return evaluation;
    } catch (err: any) {
      set({ isEvaluating: false });
      // Offline fallback evaluation
      const isCorrectAnswer = answer.toLowerCase().includes('b') || answer.includes('3') || answer.includes('inversely');
      const mockEval: EvaluationResult = {
        is_correct: isCorrectAnswer,
        confidence: 0.95,
        detected_misconception: isCorrectAnswer
          ? null
          : 'Confused direct vs inverse proportionality in Ohm’s Law',
        ai_feedback: isCorrectAnswer
          ? 'Spot on! Current is inversely proportional to resistance.'
          : 'Careful! When resistance increases, current decreases because it opposes charge flow.',
        adaptation_action: isCorrectAnswer ? 'CONTINUE' : 'NEW_ANALOGY',
        remedial_analogy: 'Imagine squeezing a water pipe: constriction (resistance) slows down the water flow (current).',
        updated_mastery: isCorrectAnswer ? 85.0 : 55.0,
        next_action: isCorrectAnswer ? 'CONTINUE' : 'REVIEW',
      };
      set({ lastEvaluation: mockEval });
      return mockEval;
    }
  },

  askDoubt: async (query: string): Promise<TeacherAnswer> => {
    const { lesson, currentSectionIndex } = get();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isAsking: true,
    }));
    get().setAvatarEmotion('thinking');

    try {
      const answer = await teachingApi.askTeacher(
        lesson?.id || 1,
        currentSectionIndex,
        query
      );

      const teacherMsg: ChatMessage = {
        id: `teacher-${Date.now()}`,
        role: 'teacher',
        text: answer.answer,
        analogy: answer.analogy || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, teacherMsg],
        isAsking: false,
      }));

      get().narrateText(
        answer.analogy ? `${answer.answer} Real-world analogy: ${answer.analogy}` : answer.answer,
        (answer.avatar_emotion as any) || 'explaining'
      );

      return answer;
    } catch {
      const fallbackAns: TeacherAnswer = {
        answer: `Great question! In this section, always keep the triad V = I * R in mind. Voltage pushes, Resistance resists, and Current is what actually gets through.`,
        analogy: `Think of a pump pushing water through a sand filter. The pump is voltage, the sand is resistance, and the flow is current.`,
        avatar_emotion: 'explaining',
      };

      const teacherMsg: ChatMessage = {
        id: `teacher-${Date.now()}`,
        role: 'teacher',
        text: fallbackAns.answer,
        analogy: fallbackAns.analogy || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, teacherMsg],
        isAsking: false,
      }));

      get().narrateText(fallbackAns.answer, 'explaining');
      return fallbackAns;
    }
  },

  advanceSection: async () => {
    const { lesson, currentSectionIndex } = get();
    if (!lesson) return;

    const nextIdx = currentSectionIndex + 1;
    if (nextIdx < lesson.sections.length) {
      try {
        await lessonApi.selectConcept(lesson.id, nextIdx);
      } catch {
        // ignore offline errors
      }
      get().setSectionIndex(nextIdx);
    } else {
      set({ pedagogicalStep: 'CONTINUE' });
      get().setAvatarEmotion('celebratory');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
      });
      get().narrateText(
        'Congratulations! You have completed all essential concepts of this complete topic! You are ready for your Diagnostic Mastery Assessment.',
        'celebratory'
      );
    }
  },

  selectConcept: async (index: number) => {
    const { lesson } = get();
    if (!lesson || index < 0 || index >= lesson.sections.length) return;
    try {
      const updated = await lessonApi.selectConcept(lesson.id, index);
      set({ lesson: updated });
    } catch {
      // offline fallback
    }
    get().setSectionIndex(index);
  },

  resumeLesson: async () => {
    const { lesson } = get();
    if (!lesson) return;
    try {
      const updated = await lessonApi.resumeLesson(lesson.id);
      set({ lesson: updated, currentSectionIndex: updated.current_section_index });
      get().setSectionIndex(updated.current_section_index);
    } catch {
      // offline fallback
    }
  },
}));
