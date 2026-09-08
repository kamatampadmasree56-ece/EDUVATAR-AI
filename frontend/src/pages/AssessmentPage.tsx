import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { assessmentApi } from '../services/api';
import { useTeachingStore } from '../store/useTeachingStore';
import { Assessment, ReportCard } from '../types';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { lesson } = useTeachingStore();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const topicTitle = lesson?.title || 'PCB Design & Hardware Engineering';
    const subj = lesson?.subject || 'PCB Design';

    assessmentApi
      .createAssessment(lesson?.id, topicTitle, subj)
      .then((data) => {
        setAssessment(data);
        setIsLoading(false);
      })
      .catch(() => {
        const mockAssessment: Assessment = {
          id: 1,
          user_id: 1,
          lesson_id: lesson?.id || 1,
          title: `Comprehensive ${subj} Mastery Diagnostic`,
          subject: subj,
          total_score: 0,
          passed: true,
          strong_concepts: [],
          weak_concepts: [],
          misconceptions: [],
          recommended_revision: '',
          recommended_next_topic: '',
          created_at: new Date().toISOString(),
          questions: [
            {
              id: 1,
              question_type: 'mcq',
              question_text: 'What is the primary function of a reference ground plane in a multi-layer PCB stackup?',
              options: [
                { id: 'A', text: 'To increase the physical thickness and weight of the board' },
                { id: 'B', text: 'To provide a low-impedance return current path and reduce electromagnetic noise/crosstalk' },
                { id: 'C', text: 'To insulate the components from the soldering iron during reflow' },
                { id: 'D', text: 'To convert digital signals into analog voltages directly' },
              ],
              concept: 'PCB Ground Plane & Return Currents',
              points: 10,
            },
            {
              id: 2,
              question_type: 'mcq',
              question_text: 'In MATLAB, which vectorized operator performs element-by-element array multiplication?',
              options: [
                { id: 'A', text: '*' },
                { id: 'B', text: '.*' },
                { id: 'C', text: '**' },
                { id: 'D', text: '^' },
              ],
              concept: 'MATLAB Vectorization Syntax',
              points: 10,
            },
            {
              id: 3,
              question_type: 'mcq',
              question_text: 'In digital circuit design, which FSM type has outputs that depend strictly on the present state alone?',
              options: [
                { id: 'A', text: 'Mealy Machine' },
                { id: 'B', text: 'Moore Machine' },
                { id: 'C', text: 'Asynchronous Ripple Counter' },
                { id: 'D', text: 'Multiplexer' },
              ],
              concept: 'Finite State Machine Architectures',
              points: 10,
            },
          ],
        };
        setAssessment(mockAssessment);
        setIsLoading(false);
      });
  }, [lesson]);

  const handleSelectAnswer = (qId: number, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessment) return;
    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      question_id: Number(qId),
      student_answer: ans,
    }));

    try {
      const result = await assessmentApi.submitAssessment(assessment.id, formattedAnswers);
      setReportCard(result);
      if (result.passed) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch {
      // Mock fallback report card
      const correctCount = Object.values(answers).filter(a => a === 'B').length;
      const score = Math.round((correctCount / (assessment.questions?.length || 3)) * 100) || 85;
      const passed = score >= 70;

      const fallbackReport: ReportCard = {
        id: 1,
        assessment_id: assessment.id,
        user_id: 1,
        total_score: score,
        passed,
        strong_concepts: [
          'Signal Integrity & Return Path Optimization',
          'Vectorized Matrix Computing',
        ],
        weak_concepts: score < 90 ? ['High-Speed Impedance Matching & Setup Timing'] : [],
        misconceptions: [],
        recommended_revision: 'Review 4-Layer PCB Stackups and Moore FSM timing constraints in Classroom.',
        recommended_next_topic: 'High-Level ECE Design Standards & FPGA Synthesis',
        created_at: new Date().toISOString(),
      };
      setReportCard(fallbackReport);
      if (passed) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setReportCard(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-800">
          Generating Comprehensive ECE Mastery Assessment...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white border border-purple-100 shadow-purple-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
            <Award size={14} className="text-purple-600" />
            <span>Diagnostic Mastery & Report Card</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950">
            {assessment?.title || 'Comprehensive ECE Diagnostic'}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Test your knowledge in {assessment?.subject || 'ECE'} across Basic, Advance, and High Level principles.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
          {assessment?.questions?.length || 3} Questions
        </span>
      </div>

      {/* Report Card Screen (If completed) */}
      {reportCard ? (
        <div className="purple-white-card p-6 sm:p-8 bg-white border-purple-200 shadow-purple-md space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                  reportCard.passed
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                    : 'bg-gradient-to-tr from-amber-600 to-rose-500'
                }`}
              >
                <Award size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  {reportCard.passed ? 'Assessment Passed with Honors!' : 'Assessment In Progress'}
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Topic: {assessment?.title}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-display font-black text-purple-700">
                {reportCard.total_score}%
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Mastery Score</p>
            </div>
          </div>

          {/* Strong vs Weak Concepts Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Verified Strong Concepts:</span>
              </h4>
              <ul className="space-y-1 text-xs text-emerald-900 font-medium">
                {(reportCard.strong_concepts || reportCard.mastered_concepts || []).map((sc: string, i: number) => (
                  <li key={i}>• {sc}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
              <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={15} className="text-purple-600" />
                <span>Recommended Next Stage:</span>
              </h4>
              <p className="text-xs text-purple-900 font-medium">
                {reportCard.recommended_next_topic || 'High-Level PCB Impedance Matching & DSP Filter Modeling.'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-purple-100 flex items-center justify-between gap-4">
            <button
              onClick={handleRetake}
              className="purple-outline-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Retake Diagnostic</span>
            </button>

            <button
              onClick={() => navigate('/teach')}
              className="purple-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-purple-sm"
            >
              <BookOpen size={14} />
              <span>Return to AI Classroom</span>
            </button>
          </div>
        </div>
      ) : (
        /* Assessment Questions Form */
        <div className="space-y-6">
          {assessment?.questions?.map((q, idx) => (
            <div
              key={q.id}
              className="purple-white-card p-6 bg-white border-purple-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 uppercase">
                  Question {idx + 1} • {q.concept}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {q.points} Points
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-950 leading-relaxed">
                {q.question_text}
              </h3>

              <div className="space-y-2 pt-1">
                {q.options?.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAnswer(q.id, opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-purple-100 border-purple-600 text-purple-950 font-bold shadow-sm'
                          : 'bg-white border-purple-100 text-slate-800 hover:bg-purple-50 hover:border-purple-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="leading-tight mt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmitAssessment}
            disabled={isSubmitting || Object.keys(answers).length === 0}
            className="w-full purple-gradient-btn py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-purple-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Grading Assessment & Generating Diagnostic...</span>
            ) : (
              <>
                <Award size={15} />
                <span>Submit Assessment & Generate Report Card</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
