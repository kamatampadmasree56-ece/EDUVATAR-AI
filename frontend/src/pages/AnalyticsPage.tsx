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
  Zap
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
        // Fallback default metrics for zero-cost demo presentation
        setAnalytics({
          streak_days: 5,
          total_minutes: 135,
          completed_lessons: 4,
          average_mastery: 78.5,
          strong_concepts: ["Voltage & Electrical Potential", "Ohm's Law Triad (V=IR)", "Direct Current (DC) Basics"],
          weak_concepts: ["Inverse Proportionality in Resistance", "Kirchhoff's Voltage Law (KVL)"],
          concept_radar: [
            { concept: "Ohm's Law", mastery: 88, subject: "Physics" },
            { concept: "Voltage", mastery: 92, subject: "Physics" },
            { concept: "Current Flow", mastery: 84, subject: "Physics" },
            { concept: "Resistance", mastery: 65, subject: "Physics" },
            { concept: "Circuit Power", mastery: 74, subject: "Physics" },
            { concept: "Kirchhoff Laws", mastery: 48, subject: "Physics" },
          ],
          recent_activity: [
            { action: "Mastered Section", topic: "Ohm's Law: Voltage & Resistance", time: "15 mins ago", badge: "+15% Mastery" },
            { action: "Misconception Resolved", topic: "Water Pipe Constriction Model", time: "30 mins ago", badge: "Gap Fixed" },
            { action: "Diagnostic Completed", topic: "Circuit Mastery Check", time: "2 hours ago", badge: "Score 90%" },
          ],
        });
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading student mastery radar & metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <BarChart3 size={13} className="text-cyan-400" />
          <span>Learner Mastery Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
          Cognitive Analytics & Concept Radar
        </h1>
        <p className="text-xs text-slate-400">
          Track real-time conceptual fluency, diagnosed mental models, study streaks, and topic retention.
        </p>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl glass-card border border-amber-500/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Study Streak</span>
            <Flame size={18} className="text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-white">{analytics.streak_days}</span>
            <span className="text-xs text-slate-400 ml-1">Days Active</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono">Consistency Streak</span>
        </div>

        {/* Total Time */}
        <div className="p-5 rounded-2xl glass-card border border-brand-500/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Time Spent</span>
            <Clock size={18} className="text-brand-400" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-white">{analytics.total_minutes}</span>
            <span className="text-xs text-slate-400 ml-1">Minutes</span>
          </div>
          <span className="text-[10px] text-brand-300 font-mono">Interactive Learning</span>
        </div>

        {/* Completed Lessons */}
        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lessons Finished</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-white">{analytics.completed_lessons}</span>
            <span className="text-xs text-slate-400 ml-1">Curriculums</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">Mastery Completed</span>
        </div>

        {/* Avg Mastery */}
        <div className="p-5 rounded-2xl glass-card border border-cyan-500/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Avg Mastery</span>
            <TrendingUp size={18} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-3xl font-black font-display text-white">{analytics.average_mastery}%</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">Cognitive Retention</span>
        </div>
      </div>

      {/* Main Grid: Concept Radar Chart & Strong/Weak Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recharts Concept Radar (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-brand-400" />
                <span>Multi-Dimensional Concept Mastery Radar</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing student comprehension across interconnected circuit principles.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Target: 80%+
            </span>
          </div>

          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.concept_radar}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="concept" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#0c8ce9"
                  fill="#0c8ce9"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strong & Weak Concepts Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Strong Concepts */}
          <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>Strong Concepts (Mastered)</span>
              <CheckCircle2 size={15} />
            </div>
            <div className="space-y-2">
              {analytics.strong_concepts.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-medium">{sc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Concepts (Need Review) */}
          <div className="p-5 rounded-2xl glass-card border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>Misconception Focus Areas</span>
              <AlertCircle size={15} />
            </div>
            <div className="space-y-2">
              {analytics.weak_concepts.map((wc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-medium">{wc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Learning Activity
            </h4>
            <div className="space-y-2.5 text-xs">
              {analytics.recent_activity.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200">{act.topic}</div>
                    <div className="text-[10px] text-slate-500">{act.time}</div>
                  </div>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono">
                    {act.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
