import React, { useState } from 'react';
import { X, Sparkles, User, Lock, Mail, Play } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemoJudge, isLoading, error } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('Friendly Mentor');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          teaching_style: teachingStyle,
        });
      }
      onClose();
    } catch {
      // Handled by auth store
    }
  };

  const handleDemoLogin = async () => {
    await loginAsDemoJudge();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-purple-200 shadow-purple-lg space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-purple-50 text-slate-500 hover:text-purple-900 hover:bg-purple-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-display font-black text-slate-950">
            {mode === 'login' ? 'Welcome Back to EDUVATAR AI' : 'Join EDUVATAR AI'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {mode === 'login'
              ? 'Log in to access your adaptive learning session'
              : 'Create an account to track your ECE mastery metrics'}
          </p>
        </div>

        {/* Instant Judge One-Click Demo */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full purple-gradient-btn py-2.5 px-4 rounded-xl text-xs font-bold shadow-purple-md flex items-center justify-center gap-2"
        >
          <Play size={13} className="fill-white" />
          <span>One-Click Student / Evaluator Login</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-purple-100" />
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Or Continue With</span>
          <div className="flex-1 h-[1px] bg-purple-100" />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3 text-purple-600" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3 text-purple-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-3 text-purple-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full purple-gradient-btn py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-purple-sm disabled:opacity-50"
          >
            {isLoading ? <span>Authenticating...</span> : <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900"
          >
            {mode === 'login'
              ? "Don't have an account? Create one"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
