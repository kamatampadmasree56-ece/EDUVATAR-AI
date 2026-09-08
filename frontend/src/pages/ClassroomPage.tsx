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
  Check,
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
    resumeLesson,
  } = useTeachingStore();

  const [rightPanelTab, setRightPanelTab] = useState<'checkpoint' | 'doubt'>('checkpoint');
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // If no lesson is loaded, auto-seed PCB Design Demo
  useEffect(() => {
    if (!lesson) {
      setIsLoadingDemo(true);
      loginAsDemoJudge()
        .then(() => demoApi.startCourse('pcb-design'))
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
        <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-800">
          Initializing Adaptive AI Educator & Classroom...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Complete Topic Progress Header */}
      <div className="purple-white-card p-5 bg-white space-y-4 border-purple-200 shadow-purple-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                {lesson?.learning_mode === 'complete_learning' ? 'ECE Specialized Curriculum' : lesson?.learning_mode?.replace('_', ' ').toUpperCase() || 'ECE Specialized Curriculum'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-bold text-purple-700 uppercase">
                {lesson?.subject || 'PCB Design'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {lesson?.target_level || 'Basic'} Stage
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-950 flex items-center gap-2">
              <span>{lesson?.title}</span>
            </h1>
          </div>

          {/* 6-Step Pedagogical Loop Badge Strip */}
          <div className="flex items-center gap-1 bg-purple-50 p-1.5 rounded-xl border border-purple-200 overflow-x-auto text-[11px] font-mono shrink-0">
            {loopSteps.map((step) => {
              const isActive = pedagogicalStep === step.key;
              return (
                <button
                  key={step.key}
                  onClick={() => setPedagogicalStep(step.key as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-bold ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-purple-sm'
                      : 'text-slate-700 hover:text-purple-900 hover:bg-purple-100/60'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600" />
              <span>CURRICULUM MASTERY PROGRESS</span>
            </span>
            <span className="font-mono text-purple-900 font-bold">
              {completedConcepts} / {totalConcepts} Concepts Mastered ({progressPct}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-purple-200">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-royal-500 to-indigo-600 transition-all duration-700"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Classroom Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Teacher Avatar & Syllabus Navigator */}
        <div className="lg:col-span-4 space-y-4">
          <TeacherAvatar teachingStyle={lesson?.teaching_style} />

          {/* Section Syllabus Index */}
          <div className="purple-white-card p-4 bg-white space-y-3 border-purple-200">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Course Syllabus
              </span>
              <span className="text-xs font-mono font-bold text-purple-700">
                {currentSectionIndex + 1} of {totalConcepts}
              </span>
            </div>

            {/* Concept Tree Item List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {lesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === currentSectionIndex;
                const isCompleted = sec.status === 'completed' || idx < currentSectionIndex;

                return (
                  <button
                    key={sec.id || idx}
                    onClick={() => selectConcept(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold shadow-sm'
                        : isCompleted
                        ? 'bg-purple-50/50 border-purple-200 text-slate-800 hover:bg-purple-50'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {sec.title || sec.concept}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {sec.concept}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area (8 cols): Interactive Blackboard & Checkpoint / Doubt Tabs */}
        <div className="lg:col-span-8 space-y-4">
          {/* Blackboard Surface */}
          <div className="purple-white-card p-5 bg-white border-purple-200 min-h-[420px]">
            <Blackboard
              section={currentSection}
              isDemonstrating={pedagogicalStep === 'DEMONSTRATE'}
              subject={lesson?.subject}
            />
          </div>

          {/* Interactive Checkpoint / Doubt Tabs */}
          <div className="purple-white-card bg-white border-purple-200 overflow-hidden">
            {/* Tab Selector */}
            <div className="flex border-b border-purple-100 bg-purple-50/50">
              <button
                onClick={() => setRightPanelTab('checkpoint')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  rightPanelTab === 'checkpoint'
                    ? 'bg-white text-purple-900 border-b-2 border-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Award size={15} className={rightPanelTab === 'checkpoint' ? 'text-purple-600' : ''} />
                <span>Interactive Checkpoint Quiz</span>
              </button>

              <button
                onClick={() => setRightPanelTab('doubt')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  rightPanelTab === 'doubt'
                    ? 'bg-white text-purple-900 border-b-2 border-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <MessageSquare size={15} className={rightPanelTab === 'doubt' ? 'text-purple-600' : ''} />
                <span>Ask AI Teacher (Voice / Text)</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {rightPanelTab === 'checkpoint' ? (
                <CheckpointQuiz
                  section={currentSection}
                  onMastered={() => advanceSection()}
                />
              ) : (
                <TeacherDoubtChat
                  lessonId={lesson?.id || 1}
                  currentSectionIndex={currentSectionIndex}
                />
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => selectConcept(Math.max(0, currentSectionIndex - 1))}
              disabled={currentSectionIndex === 0}
              className="purple-outline-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft size={14} />
              <span>Previous Concept</span>
            </button>

            <div className="flex items-center gap-2">
              {currentSectionIndex < totalConcepts - 1 ? (
                <button
                  onClick={() => advanceSection()}
                  className="purple-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-purple-sm"
                >
                  <span>Next Concept</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/assessments')}
                  className="purple-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-purple-sm"
                >
                  <Award size={14} />
                  <span>Take Final Assessment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
