import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, Mic, Send, Sparkles, RefreshCw } from 'lucide-react';
import { LessonSection, Question } from '../../types';
import { useTeachingStore } from '../../store/useTeachingStore';

interface CheckpointQuizProps {
  section?: LessonSection;
  questions?: Question[];
  onMastered?: () => void;
  onNextSection?: () => void;
}

export const CheckpointQuiz: React.FC<CheckpointQuizProps> = ({
  section,
  questions = [],
  onMastered,
  onNextSection,
}) => {
  const {
    submitAnswer,
    lastEvaluation,
    isEvaluating,
    isListeningMic,
    startListeningMic,
    stopListeningMic,
  } = useTeachingStore();

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');

  const activeQuestions = section?.questions || questions;
  const currentQuestion: Question = (activeQuestions && activeQuestions.length > 0)
    ? activeQuestions[0]
    : {
        id: 1,
        question_type: 'short_answer',
        question_text: `Explain the core purpose or working rule of ${section?.concept || 'this engineering concept'}.`,
        options: [],
        correct_answer: 'Core working principle',
        explanation: 'Follows standard engineering formulas and design guidelines.',
        difficulty: 'medium',
        concept_tested: section?.concept || 'Core Concept',
      };

  const handleMicAnswer = () => {
    if (isListeningMic) {
      stopListeningMic();
    } else {
      startListeningMic((transcript) => {
        setCustomAnswer(transcript);
        const upper = transcript.toUpperCase();
        if (upper.includes('OPTION B') || upper.includes(' B ') || upper.includes('HALF')) {
          setSelectedOption('B');
        } else if (upper.includes('OPTION A') || upper.includes(' A ')) {
          setSelectedOption('A');
        }
      });
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = selectedOption || customAnswer;
    if (!finalAnswer.trim()) return;
    await submitAnswer(currentQuestion.id, finalAnswer);
  };

  const handleAdvance = () => {
    if (onMastered) onMastered();
    else if (onNextSection) onNextSection();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl p-1 justify-between space-y-4 text-slate-900">
      {/* Quiz Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
            <HelpCircle size={15} />
            <span>Interactive Understanding Checkpoint</span>
          </span>
          <span className="text-[11px] font-mono bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-bold">
            Step 4: EVALUATE & ADAPT
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-950 leading-snug">
          {currentQuestion.question_text}
        </h4>
      </div>

      {/* Options List (If MCQ) or Text Input (Short Answer) */}
      <div className="space-y-2.5 my-2">
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          currentQuestion.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedOption(opt.id);
                setCustomAnswer('');
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                selectedOption === opt.id
                  ? 'bg-purple-100 border-purple-600 text-purple-950 font-bold shadow-sm'
                  : 'bg-white border-purple-100 text-slate-800 hover:bg-purple-50 hover:border-purple-200'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${
                  selectedOption === opt.id
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                {opt.id}
              </span>
              <span className="leading-tight mt-0.5">{opt.text}</span>
            </button>
          ))
        ) : (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={customAnswer}
              onChange={(e) => {
                setCustomAnswer(e.target.value);
                setSelectedOption('');
              }}
              placeholder="Type your explanation or answer in your own words, or use voice input..."
              className="w-full p-3 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white font-medium"
            />
          </div>
        )}
      </div>

      {/* Voice & Submit Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
        <button
          type="button"
          onClick={handleMicAnswer}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
            isListeningMic
              ? 'bg-rose-100 border-rose-400 text-rose-700 animate-pulse'
              : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
          }`}
          title="Speak your answer"
        >
          <Mic size={14} />
          <span>{isListeningMic ? 'Listening...' : 'Voice Input'}</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isEvaluating || (!selectedOption && !customAnswer.trim())}
          className="flex-1 purple-gradient-btn py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
        >
          {isEvaluating ? (
            <span>Evaluating Answer...</span>
          ) : (
            <>
              <Send size={13} />
              <span>Submit for AI Evaluation</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluation Feedback Panel */}
      {lastEvaluation && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 animate-in fade-in ${
            lastEvaluation.is_correct
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {lastEvaluation.is_correct ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={16} className="text-amber-600" />
              )}
              <span>{lastEvaluation.is_correct ? 'Correct! Concept Mastered' : 'Needs Fine-Tuning'}</span>
            </span>
            <span className="font-mono font-bold">
              Mastery: {lastEvaluation.updated_mastery}%
            </span>
          </div>

          <p className="text-xs leading-relaxed font-medium">
            {lastEvaluation.ai_feedback || (lastEvaluation.is_correct ? 'Concept understanding verified!' : 'Review the analogy on the whiteboard.')}
          </p>

          <button
            onClick={handleAdvance}
            className="w-full purple-gradient-btn py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm mt-1"
          >
            <span>Proceed to Next Stage</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
