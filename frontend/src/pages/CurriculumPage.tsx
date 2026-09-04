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
  RefreshCw
} from 'lucide-react';
import { lessonApi, documentApi } from '../services/api';
import { useTeachingStore } from '../store/useTeachingStore';
import { Lesson, DocumentItem } from '../types';

export const CurriculumPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLesson } = useTeachingStore();

  const [mode, setMode] = useState<'topic' | 'document'>('topic');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [targetLevel, setTargetLevel] = useState('Beginner');
  const [duration, setDuration] = useState(15);
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
      setError(err.message || 'Failed to generate curriculum. Loading demo lesson.');
      // Offline fallback: navigate to classroom
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={13} className="text-cyan-400" />
          <span>Intelligent Curriculum Orchestrator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
          Generate a Personalized Curriculum
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          EDUVATAR AI plans a structured, multi-section interactive learning path calibrated specifically to your background and speed.
        </p>
      </div>

      {/* Main Generator Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl max-w-3xl mx-auto">
        {/* Mode Selector */}
        <div className="flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setMode('topic')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'topic'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={15} />
            <span>Generate by Topic / Concept</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === 'document'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>Grounded on Uploaded Textbook / PDF</span>
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {mode === 'topic' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Topic or Concept You Want to Master
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Ohm's Law, Quantum Superposition, Neural Networks, Bayes' Theorem"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Uploaded Document Source
              </label>
              {documents.length > 0 ? (
                <select
                  value={selectedDocId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedDocId(id);
                    const doc = documents.find((d) => d.id === id);
                    if (doc) setTopic(doc.title);
                  }}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose a document --</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.file_type.toUpperCase()} • {doc.total_pages} pages)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-center space-y-2">
                  <p className="text-xs text-slate-400">No documents uploaded yet.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/documents')}
                    className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500/30"
                  >
                    Upload Textbook or Lecture Slides
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grid Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Domain</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Physics">Physics & Electrical Engineering</option>
                <option value="Computer Science">Computer Science & AI</option>
                <option value="Mathematics">Mathematics & Calculus</option>
                <option value="Chemistry">Chemistry & Materials</option>
                <option value="Biology">Biology & Medicine</option>
              </select>
            </div>

            {/* Target Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Difficulty Level</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Beginner">Beginner (Foundational Intuition & Analogies)</option>
                <option value="Intermediate">Intermediate (Formulas, Equations & Derivations)</option>
                <option value="Advanced">Advanced (Rigorous Proofs & Edge Cases)</option>
              </select>
            </div>

            {/* Teaching Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">AI Teacher Persona</label>
              <select
                value={teachingStyle}
                onChange={(e) => setTeachingStyle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Friendly Mentor">Friendly Mentor (Warm, encouraging, analogies)</option>
                <option value="Professor">Professor (Structured, academic rigor)</option>
                <option value="Patient Tutor">Patient Tutor (Gentle step-by-step guidance)</option>
                <option value="Strict Exam Coach">Strict Exam Coach (High-speed, trap questions)</option>
                <option value="Coding Mentor">Coding Mentor (Practical, hands-on)</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instruction Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish (Colloquial mix)</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Orchestrating Adaptive Curriculum...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Build Curriculum & Enter Classroom</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Previously Generated Curriculums */}
      {recentLessons.length > 0 && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Your Active Curriculums
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {recentLessons.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between gap-4 hover:border-brand-500/40 transition-colors"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{l.title}</span>
                    <span className="text-[10px] bg-brand-500/10 text-brand-300 px-2 py-0.5 rounded font-mono">
                      {l.subject}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {l.total_sections} sections • Mastery: {Math.round(l.current_mastery)}%
                  </p>
                </div>

                <button
                  onClick={() => handleResumeLesson(l)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white border border-brand-500/40 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Play size={12} className="fill-current" />
                  <span>Resume</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
