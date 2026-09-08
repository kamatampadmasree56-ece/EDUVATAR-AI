import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  Layers,
  Globe,
  Sliders,
  Play,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Zap,
} from 'lucide-react';
import { lessonApi, documentApi } from '../services/api';
import { useTeachingStore } from '../store/useTeachingStore';
import { Lesson, DocumentItem } from '../types';

export const CurriculumPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLesson } = useTeachingStore();

  const [mode, setMode] = useState<'topic' | 'document'>('topic');
  const [topic, setTopic] = useState('PCB 4-Layer Stackup & Impedance');
  const [subject, setSubject] = useState('PCB Design');
  const [targetLevel, setTargetLevel] = useState<'Basic' | 'Advance' | 'High Level'>('Basic');
  const [duration, setDuration] = useState(25);
  const [language, setLanguage] = useState('English');
  const [teachingStyle, setTeachingStyle] = useState('Friendly Mentor');
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lessonApi.listLessons().then(setRecentLessons).catch(() => {});
    documentApi.list().then(setDocuments).catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && mode === 'topic') return;

    setIsGenerating(true);
    setError(null);

    try {
      const generated = await lessonApi.generateLesson({
        title: topic.trim() || 'Custom Curriculum',
        topic: topic.trim() || 'Custom Curriculum',
        subject,
        target_level: targetLevel,
        duration_minutes: duration,
        language,
        teaching_style: teachingStyle,
        document_id: mode === 'document' ? selectedDocId : undefined,
      });

      setLesson(generated);
      navigate('/teach');
    } catch (err: any) {
      setError(err.message || 'Failed to generate curriculum. Loading classroom.');
      navigate('/teach');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResumeLesson = (l: Lesson) => {
    setLesson(l);
    navigate('/teach');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={13} className="text-purple-600" />
          <span>ECE Curriculum Orchestrator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-950">
          Generate a Personalized Curriculum
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          EDUVATAR AI plans a structured, multi-section interactive learning path calibrated for <strong className="text-purple-700">PCB Design</strong>, <strong className="text-purple-700">MATLAB</strong>, <strong className="text-purple-700">Analog & Digital Circuits</strong>, or <strong className="text-purple-700">DCD</strong>.
        </p>
      </div>

      {/* Main Generator Form Card */}
      <div className="purple-white-card p-6 sm:p-8 bg-white border-purple-200 shadow-purple-md max-w-3xl mx-auto space-y-6">
        {/* Mode Selector */}
        <div className="flex p-1 rounded-2xl bg-purple-50 border border-purple-200">
          <button
            type="button"
            onClick={() => setMode('topic')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'topic'
                ? 'bg-purple-600 text-white shadow-purple-sm'
                : 'text-slate-700 hover:text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <BookOpen size={14} />
            <span>By Topic Concept</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'document'
                ? 'bg-purple-600 text-white shadow-purple-sm'
                : 'text-slate-700 hover:text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <FileText size={14} />
            <span>From Uploaded PDF Document</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5 text-slate-900">
          {mode === 'topic' ? (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Topic or Specialized Concept:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. PCB Differential Pairs, Simulink PID Tuning, CMOS Inverters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Select Uploaded Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.subject})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Grid of options: Subject, Level, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Subject Area:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="PCB Design">PCB Design</option>
                <option value="MATLAB">MATLAB & Simulink</option>
                <option value="Analog and Digital Circuits">Analog & Digital Circuits</option>
                <option value="DCD">DCD (Digital Circuit Design)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Stage Level:
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Basic">Basic (Foundations)</option>
                <option value="Advance">Advance (Engineering Analysis)</option>
                <option value="High Level">High Level (Mastery & Standards)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Duration:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={15}>15 Minutes (Express)</option>
                <option value={25}>25 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full purple-gradient-btn py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-purple-md disabled:opacity-50"
          >
            {isGenerating ? (
              <span>Orchestrating Socratic Curriculum...</span>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Curriculum & Launch Classroom</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Lessons */}
      {recentLessons.length > 0 && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <h3 className="text-base font-bold text-slate-950">
            Recent Curricula & Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentLessons.slice(0, 4).map((l) => (
              <div
                key={l.id}
                onClick={() => handleResumeLesson(l)}
                className="purple-white-card p-4 bg-white border-purple-100 hover:border-purple-300 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{l.title}</h4>
                  <p className="text-[10px] text-purple-700 font-semibold">{l.subject} • {l.target_level}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Play size={14} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
