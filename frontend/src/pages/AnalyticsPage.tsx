import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../services/api';
import { StudyAnalytics } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getDashboard()
      .then((data) => {
        setAnalytics(data);
        setIsLoading(false);
      })
      .catch(() => {
        setAnalytics({
          streak_days: 7,
          total_minutes: 185,
          completed_lessons: 6,
          average_mastery: 84.5,
          strong_concepts: [
            'PCB 4-Layer Stackup & Impedance Routing',
            'MATLAB Vectorized Signal FFT',
            'Op-Amp Golden Rules & Gain Math',
            'Mealy vs. Moore FSM Synthesis',
          ],
          weak_concepts: [
            'FPGA Static Timing Analysis (STA) Setup Margins',
            'High-Speed Differential Pair Length Skew',
          ],
          concept_radar: [
            { concept: 'PCB Layout', mastery: 88, subject: 'PCB Design' },
            { concept: 'MATLAB DSP', mastery: 92, subject: 'MATLAB' },
            { concept: 'Op-Amps & MOSFETs', mastery: 85, subject: 'Circuits' },
            { concept: 'Digital FSMs', mastery: 78, subject: 'DCD' },
            { concept: 'Impedance Match', mastery: 70, subject: 'PCB Design' },
            { concept: 'FPGA Timing', mastery: 65, subject: 'DCD' },
          ],
          recent_activity: [
            { action: 'Mastered Concept', topic: 'PCB 4-Layer Ground Plane Architecture', time: '10 mins ago', badge: '+20% Mastery' },
            { action: 'Quiz Evaluated', topic: 'MATLAB Butterworth Filter Design', time: '45 mins ago', badge: 'Score 95%' },
            { action: 'AI Doubt Resolved', topic: 'D Flip-Flop Setup vs. Hold Times', time: '2 hours ago', badge: 'Analogy Applied' },
          ],
        });
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-700">Loading student mastery radar & telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider">
          <BarChart3 size={13} className="text-purple-600" />
          <span>ECE Mastery Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950">
          Cognitive Analytics & Concept Radar
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Track real-time conceptual fluency across PCB Design, MATLAB, Analog/Digital Circuits, and DCD.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="purple-white-card p-5 bg-white border-purple-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Study Streak</span>
            <Flame size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-slate-950">{analytics.streak_days}</span>
            <span className="text-xs text-slate-500 font-semibold ml-1">Days Active</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold font-mono">Continuous Consistency</span>
        </div>

        {/* Study Time */}
        <div className="purple-white-card p-5 bg-white border-purple-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Time in Class</span>
            <Clock size={18} className="text-purple-600" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-slate-950">{analytics.total_minutes}</span>
            <span className="text-xs text-slate-500 font-semibold ml-1">Total Mins</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">+45 mins this week</span>
        </div>

        {/* Completed Lessons */}
        <div className="purple-white-card p-5 bg-white border-purple-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Stages Mastered</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-slate-950">{analytics.completed_lessons}</span>
            <span className="text-xs text-slate-500 font-semibold ml-1">Curricula</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold font-mono">100% Socratic Completion</span>
        </div>

        {/* Mastery Average */}
        <div className="purple-white-card p-5 bg-white border-purple-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Overall Mastery</span>
            <TrendingUp size={18} className="text-purple-600" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-purple-700">{analytics.average_mastery}%</span>
            <span className="text-xs text-slate-500 font-semibold ml-1">Score</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold font-mono">High-Level Fluency</span>
        </div>
      </div>

      {/* Radar Chart & Weak/Strong Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar */}
        <div className="lg:col-span-7 purple-white-card p-6 bg-white border-purple-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Multi-Disciplinary ECE Competency Radar
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              6 Core Metrics
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.concept_radar}>
                <PolarGrid stroke="#ede9fe" />
                <PolarAngleAxis dataKey="concept" stroke="#09090b" tick={{ fill: '#09090b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#c4b5fd" tick={{ fill: '#6d28d9', fontSize: 9 }} />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="#7c3aed"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strong vs Weak Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="purple-white-card p-5 bg-white border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Verified High Competencies</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-900 font-semibold">
              {analytics.strong_concepts.map((sc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{sc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="purple-white-card p-5 bg-white border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <AlertCircle size={15} className="text-amber-600" />
              <span>Recommended Next Focus</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-900 font-semibold">
              {analytics.weak_concepts.map((wc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{wc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
