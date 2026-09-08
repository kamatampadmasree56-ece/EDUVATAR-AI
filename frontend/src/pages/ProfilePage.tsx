import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Sparkles,
  BookOpen,
  Clock,
  Globe,
  Sliders,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Flame,
  Award,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api';

const EDUCATION_LEVELS = ['Middle School', 'High School', 'Undergraduate', 'Graduate', 'Professional'];
const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Telugu', 'Tamil', 'Kannada'];
const TEACHING_STYLES = ['Friendly Mentor', 'Professor', 'Strict Exam Coach', 'Patient Tutor', 'Coding Mentor'];
const DIFFICULTY_PREFS = ['Easy', 'Adaptive', 'Challenging'];
const SUBJECT_OPTIONS = [
  'Physics', 'Mathematics', 'Computer Science', 'PCB Design', 'MATLAB',
  'Analog & Digital Circuits', 'DCD / FPGA', 'Artificial Intelligence', 'Chemistry', 'Biology',
];

export const ProfilePage: React.FC = () => {
  const { user, fetchMe, logout } = useAuthStore();
  const profile = user?.profile;

  const [form, setForm] = useState({
    education_level: profile?.education_level || 'High School',
    current_knowledge: profile?.current_knowledge || 'Beginner',
    learning_goal: profile?.learning_goal || 'Master core STEM principles',
    preferred_language: profile?.preferred_language || 'English',
    teaching_style: profile?.teaching_style || 'Friendly Mentor',
    available_daily_time: profile?.available_daily_time || 20,
    difficulty_preference: profile?.difficulty_preference || 'Adaptive',
    subject_interests: profile?.subject_interests || ['Physics'],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (profile) {
      setForm({
        education_level: profile.education_level,
        current_knowledge: profile.current_knowledge,
        learning_goal: profile.learning_goal,
        preferred_language: profile.preferred_language,
        teaching_style: profile.teaching_style,
        available_daily_time: profile.available_daily_time,
        difficulty_preference: profile.difficulty_preference,
        subject_interests: profile.subject_interests,
      });
    }
  }, [profile]);

  const toggleSubject = (s: string) => {
    setForm((f) => ({
      ...f,
      subject_interests: f.subject_interests.includes(s)
        ? f.subject_interests.filter((x) => x !== s)
        : [...f.subject_interests, s],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await authApi.updateProfile(form);
      await fetchMe();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const SelectField = ({
    label,
    value,
    options,
    onChange,
    icon: Icon,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    icon: React.ElementType;
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <Icon size={13} className="text-purple-500" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-purple-100 hover:border-purple-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-purple-400" />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-purple-100 shadow-purple-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-400/30">
            <User size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-slate-950 tracking-tight">
              {user?.full_name || 'Student Profile'}
            </h1>
            <p className="text-xs font-medium text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={16} />
              <span className="text-xl font-black text-slate-800">{profile?.study_streak_days ?? 0}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-purple-500">
              <Award size={16} />
              <span className="text-xl font-black text-slate-800">{profile?.completed_lessons_count ?? 0}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Lessons</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-emerald-500">
              <Clock size={16} />
              <span className="text-xl font-black text-slate-800">{profile?.total_study_minutes ?? 0}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Minutes</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl bg-white border border-purple-100 shadow-purple-md p-6 space-y-6">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-500" />
          Learning Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Education Level"
            value={form.education_level}
            options={EDUCATION_LEVELS}
            onChange={(v) => setForm((f) => ({ ...f, education_level: v }))}
            icon={GraduationCap}
          />
          <SelectField
            label="Current Knowledge"
            value={form.current_knowledge}
            options={KNOWLEDGE_LEVELS}
            onChange={(v) => setForm((f) => ({ ...f, current_knowledge: v }))}
            icon={BookOpen}
          />
          <SelectField
            label="Teaching Style"
            value={form.teaching_style}
            options={TEACHING_STYLES}
            onChange={(v) => setForm((f) => ({ ...f, teaching_style: v }))}
            icon={Sparkles}
          />
          <SelectField
            label="Preferred Language"
            value={form.preferred_language}
            options={LANGUAGES}
            onChange={(v) => setForm((f) => ({ ...f, preferred_language: v }))}
            icon={Globe}
          />
          <SelectField
            label="Difficulty Preference"
            value={form.difficulty_preference}
            options={DIFFICULTY_PREFS}
            onChange={(v) => setForm((f) => ({ ...f, difficulty_preference: v }))}
            icon={Sliders}
          />

          {/* Daily Time */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Clock size={13} className="text-purple-500" />
              Daily Study Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={form.available_daily_time}
                onChange={(e) => setForm((f) => ({ ...f, available_daily_time: Number(e.target.value) }))}
                className="flex-1 accent-purple-600"
              />
              <span className="text-sm font-black text-purple-700 w-16 text-right">
                {form.available_daily_time} min/day
              </span>
            </div>
          </div>
        </div>

        {/* Learning Goal */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Award size={13} className="text-purple-500" />
            Learning Goal
          </label>
          <textarea
            rows={2}
            value={form.learning_goal}
            onChange={(e) => setForm((f) => ({ ...f, learning_goal: e.target.value }))}
            placeholder="e.g. Master ECE fundamentals and prepare for advanced exams..."
            className="w-full bg-white border border-purple-100 hover:border-purple-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-all"
          />
        </div>

        {/* Subject Interests */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <BookOpen size={13} className="text-purple-500" />
            Subject Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((s) => {
              const selected = form.subject_interests.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300 hover:text-purple-800'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Actions */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>

          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <CheckCircle2 size={14} /> Saved successfully
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-in fade-in">
                <AlertCircle size={14} /> Failed to save
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="purple-gradient-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
