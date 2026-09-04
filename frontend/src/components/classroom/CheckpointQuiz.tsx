import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, HelpCircle, Mic, Send, Sparkles, RefreshCw } from 'lucide-react';
import { Question } from '../../types';
import { useTeachingStore } from '../../store/useTeachingStore';

interface CheckpointQuizProps {
  questions: Question[];
  onNextSection: () => void;
}

export const CheckpointQuiz: React.FC<CheckpointQuizProps> = ({ questions, onNextSection }) => {
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

  // Use section question or high-yield default Ohm's law diagnostic question
  const currentQuestion = questions[0] || {
    id: 1,
    question_type: 'mcq',
    question_text: "If a circuit has a fixed voltage of 12V and the resistance is doubled from 3Ω to 6Ω, what happens to the electric current?",
    options: [
      { id: 'A', text: 'The current doubles to 8 Amps' },
      { id: 'B', text: 'The current halves from 4 Amps to 2 Amps' },
      { id: 'C', text: 'The current remains unchanged at 4 Amps' },
      { id: 'D', text: 'The current drops to zero immediately' },
    ],
    correct_answer: 'B',
    explanation: "Because I = V / R, current is inversely proportional to resistance. Doubling R halves I.",
    concept_tested: "Inverse Proportionality of Resistance and Current",
  };

  const handleMicAnswer = () => {
    if (isListeningMic) {
      stopListeningMic();
    } else {
      startListeningMic((transcript) => {
        setCustomAnswer(transcript);
        // Also check if transcript matches A, B, C, D
        const upper = transcript.toUpperCase();
        if (upper.includes('OPTION B') || upper.includes('B') || upper.includes('HALF')) {
          setSelectedOption('B');
        } else if (upper.includes('OPTION A') || upper.includes('A') || upper.includes('DOUBLE')) {
          setSelectedOption('A');
        }
      });
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = selectedOption || customAnswer;
    if (!finalAnswer) return;
    await submitAnswer(currentQuestion.id, finalAnswer);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-slate-700/50 p-4 justify-between space-y-4">
      {/* Quiz Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <HelpCircle size={15} />
            Diagnostic Understanding Checkpoint
          </span>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            Step 5 of 8: EVALUATE
          </span>
        </div>
        <h4 className="text-sm font-medium text-slate-100 leading-snug">
          {currentQuestion.question_text}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2 my-2">
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
                  ? 'bg-brand-500/20 border-brand-400 text-white shadow-md shadow-brand-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${
                  selectedOption === opt.id
                    ? 'bg-brand-500 border-brand-300 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {opt.id}
              </span>
              <span className="pt-0.5">{opt.text}</span>
            </button>
          ))
        ) : (
          <div className="space-y-2">
            <textarea
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="Type your explanation or answer in your own words..."
              className="w-full h-24 bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}
      </div>

      {/* Evaluation Feedback Callout */}
      {lastEvaluation && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            lastEvaluation.is_correct
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {lastEvaluation.is_correct ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Concept Mastered! (+15% Mastery)</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-amber-400" />
                <span>Misconception Identified (AI Teacher Adapting...)</span>
              </>
            )}
          </div>

          <p className="text-slate-200 leading-relaxed text-xs">
            {lastEvaluation.ai_feedback}
          </p>

          {lastEvaluation.detected_misconception && (
            <div className="bg-slate-900/60 p-2 rounded-lg border border-amber-500/20 text-[11px] text-amber-300">
              <span className="font-semibold">Detected Mental Gap: </span>
              {lastEvaluation.detected_misconception}
            </div>
          )}

          {lastEvaluation.remedial_analogy && (
            <div className="bg-brand-950/40 p-2 rounded-lg border border-brand-500/20 text-[11px] text-cyan-200">
              <span className="font-semibold">Helpful Analogy: </span>
              {lastEvaluation.remedial_analogy}
            </div>
          )}
        </div>
      )}

      {/* Submit / Advance Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={handleMicAnswer}
          className={`p-2.5 rounded-xl border transition-colors ${
            isListeningMic
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Answer by speaking via microphone"
        >
          <Mic size={16} />
        </button>

        {!lastEvaluation?.is_correct ? (
          <button
            onClick={handleSubmit}
            disabled={(!selectedOption && !customAnswer) || isEvaluating}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
              (!selectedOption && !customAnswer) || isEvaluating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-brand-500/20'
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Evaluating Thinking...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Submit Answer</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNextSection}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>Proceed to Next Section</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
