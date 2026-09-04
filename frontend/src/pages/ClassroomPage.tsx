import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  ChevronRight,
  Sliders,
  Layers,
  BookOpen,
  Lock,
  RotateCcw,
  AlertTriangle,
  Play,
  Check
} from 'lucide-react';
import { useTeachingStore } from '../store/useTeachingStore';
import { useAuthStore } from '../store/useAuthStore';
import { demoApi } from '../services/api';
import { TeacherAvatar } from '../components/avatar/TeacherAvatar';
import { Blackboard } from '../components/classroom/Blackboard';
import { CheckpointQuiz } from '../components/classroom/CheckpointQuiz';
import { TeacherDoubtChat } from '../components/classroom/TeacherDoubtChat';

export const ClassroomPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemoJudge } = useAuthStore();
  const {
    lesson,
    currentSectionIndex,
    pedagogicalStep,
    setLesson,
    setSectionIndex,
    setPedagogicalStep,
    advanceSection,
    selectConcept,
    resumeLesson
  } = useTeachingStore();

  const [rightPanelTab, setRightPanelTab] = useState<'checkpoint' | 'doubt'>('checkpoint');
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // If no lesson is loaded, auto-seed Ohm's Law Demo
  useEffect(() => {
    if (!lesson) {
      setIsLoadingDemo(true);
      loginAsDemoJudge()
        .then(() => demoApi.seedOhmsLaw())
        .then((demoLesson) => {
          setLesson(demoLesson);
          setIsLoadingDemo(false);
        })
        .catch(() => {
          setIsLoadingDemo(false);
        });
    }
  }, [lesson, loginAsDemoJudge, setLesson]);

  const currentSection = lesson?.sections[currentSectionIndex];

  // Calculate complete topic progress statistics
  const totalConcepts = lesson?.sections?.length || 0;
  const completedConcepts = lesson?.sections?.filter(s => s.status === 'completed')?.length || Math.min(currentSectionIndex, totalConcepts);
  const progressPct = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
  const isAllCompleted = completedConcepts === totalConcepts && totalConcepts > 0;

  const loopSteps = [
    { key: 'EXPLAIN', label: '1. Explain' },
    { key: 'DEMONSTRATE', label: '2. Demonstrate' },
    { key: 'QUESTION', label: '3. Question' },
    { key: 'EVALUATE', label: '4. Evaluate' },
    { key: 'ADAPT', label: '5. Adapt' },
    { key: 'CONTINUE', label: '6. Master' },
  ];

  if (isLoadingDemo && !lesson) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-300">
          Decomposing complete topic curriculum & initializing AI Teacher...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Complete Topic Progress Header */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/40 text-[10px] font-mono font-bold text-brand-300 uppercase tracking-wider">
                {lesson?.learning_mode === 'complete_learning' ? 'Complete Topic Curriculum' : lesson?.learning_mode?.replace('_', ' ').toUpperCase() || 'Complete Topic Curriculum'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                {lesson?.subject || 'Physics'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {lesson?.target_level || 'Beginner'} Level
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
              <span>{lesson?.title}</span>
            </h1>
          </div>

          {/* 8-Step Pedagogical Loop Badge Strip */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto text-[11px] font-mono shrink-0">
            {loopSteps.map((step) => {
              const isActive = pedagogicalStep === step.key;
              return (
                <button
                  key={step.key}
                  onClick={() => setPedagogicalStep(step.key as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Complete Topic Concept Progress Bar */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              <span>TOPIC CURRICULUM PROGRESS</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {completedConcepts} / {totalConcepts} Concepts Completed ({progressPct}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prerequisite Alert Banner if present */}
      {currentSection?.prerequisites && currentSection.prerequisites.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs flex items-center justify-between text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Prerequisite Requirement:</strong> Before mastering <em>"{currentSection.concept}"</em>, confirm understanding of: <strong>{currentSection.prerequisites.join(', ')}</strong>
            </span>
          </div>
          <button
            onClick={() => selectConcept(Math.max(0, currentSectionIndex - 1))}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-semibold text-amber-300 shrink-0 transition-colors"
          >
            Review Prerequisite
          </button>
        </div>
      )}

      {/* Main Classroom Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (3 cols): Teacher Avatar & Complete Topic Syllabus Navigator */}
        <div className="lg:col-span-3 space-y-4">
          <TeacherAvatar teachingStyle={lesson?.teaching_style} />

          {/* Section Syllabus Index */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Syllabus Concepts
              </span>
              <span className="text-xs font-mono font-bold text-brand-400">
                {currentSectionIndex + 1} of {totalConcepts}
              </span>
            </div>

            {/* Concept Tree Item List */}
            <div className="space-y-1.5 pt-1 max-h-[380px] overflow-y-auto pr-1">
              {lesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === currentSectionIndex;
                const isCompleted = sec.status === 'completed' || idx < currentSectionIndex;
                const isReview = sec.status === 'review_needed';
                const isLocked = sec.status === 'locked';

                return (
                  <button
                    key={idx}
                    disabled={isLocked}
                    onClick={() => selectConcept(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                      isCurrent
                        ? 'bg-brand-500/20 border-brand-500/50 text-white font-semibold glow-brand'
                        : isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 hover:bg-emerald-950/40'
                        : isReview
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200 hover:bg-amber-950/40'
                        : isLocked
                        ? 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 font-bold ${
                          isCurrent
                            ? 'bg-brand-500 text-white'
                            : isCompleted
                            ? 'bg-emerald-500 text-slate-950'
                            : isReview
                            ? 'bg-amber-500 text-slate-950'
                            : isLocked
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check size={11} /> : isLocked ? <Lock size={10} /> : idx + 1}
                      </span>
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isCurrent && <ChevronRight size={14} className="text-brand-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Resume / Continue CTA */}
            <button
              onClick={resumeLesson}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
            >
              <RotateCcw size={13} />
              <span>Resume Current Concept</span>
            </button>
          </div>
        </div>

        {/* Center Column (5 cols): Blackboard & Visual Demonstration Lab */}
        <div className="lg:col-span-5 space-y-4">
          <Blackboard
            section={currentSection}
            isDemonstrating={pedagogicalStep === 'DEMONSTRATE'}
          />

          {/* Section Explanation Narrative */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen size={16} className="text-brand-400" />
                <span>Concept: {currentSection?.concept}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                {currentSection?.importance || 'Essential'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSection?.explanation_text}
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Student Interaction Dock (Checkpoint Quiz & Doubt Chat) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dock Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setRightPanelTab('checkpoint')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                rightPanelTab === 'checkpoint'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle size={14} />
              <span>Checkpoint Quiz</span>
            </button>
            <button
              onClick={() => setRightPanelTab('doubt')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                rightPanelTab === 'doubt'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} />
              <span>Ask Teacher Doubt</span>
            </button>
          </div>

          {rightPanelTab === 'checkpoint' ? (
            <CheckpointQuiz
              questions={currentSection?.questions || []}
              onNextSection={advanceSection}
            />
          ) : (
            <TeacherDoubtChat />
          )}

          {/* Topic Completion Card when finished */}
          {isAllCompleted && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/40 text-center space-y-3 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 text-xl font-bold">
                🎓
              </div>
              <h2 className="text-lg font-bold text-white">TOPIC COMPLETED!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have systematically mastered all {totalConcepts} concepts of <strong>{lesson?.title}</strong> from beginning to end!
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center justify-around text-slate-300">
                <div>
                  <span className="block text-[10px] text-slate-500">Concepts</span>
                  <span className="font-bold text-emerald-400 text-sm">{totalConcepts}/{totalConcepts}</span>
                </div>
                <div className="border-r border-slate-800 h-6" />
                <div>
                  <span className="block text-[10px] text-slate-500">Topic Mastery</span>
                  <span className="font-bold text-cyan-300 text-sm">{Math.round(lesson?.current_mastery || 92)}%</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/assessments')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Award size={15} />
                <span>Take Diagnostic Final Exam</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

