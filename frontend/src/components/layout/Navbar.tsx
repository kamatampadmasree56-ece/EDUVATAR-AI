import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Play,
  Compass,
  FileText,
  BarChart3,
  Award,
  Sparkles,
  User as UserIcon,
  LogOut,
  BookMarked,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeachingStore } from '../../store/useTeachingStore';
import { demoApi } from '../../services/api';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();

  const handleLaunchJudgeDemo = async () => {
    try {
      await loginAsDemoJudge();
      const lesson = await demoApi.seedOhmsLaw();
      setLesson(lesson);
      navigate('/teach');
    } catch {
      navigate('/teach');
    }
  };

  const navLinks = [
    { label: 'AI Classroom', path: '/teach', icon: GraduationCap },
    { label: 'Courses', path: '/courses', icon: BookMarked },
    { label: 'Curriculum', path: '/curriculum', icon: Sparkles },
    { label: 'Assessments', path: '/assessments', icon: Award },
    { label: 'Roadmap', path: '/roadmap', icon: Compass },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'RAG Docs', path: '/documents', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1px] shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <GraduationCap className="text-cyan-400 group-hover:scale-110 transition-transform" size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                EDUVATAR<span className="text-brand-400 font-normal ml-1">AI</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-widest font-mono">
                ADAPTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              The Human-Like Adaptive AI Educator
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-2.5">
          {/* Instant Judge Showcase Demo Button */}
          <button
            onClick={handleLaunchJudgeDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play size={13} className="fill-white" />
            <span className="hidden sm:inline">Launch Ohm's Law Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden lg:block text-right text-xs">
                <div className="font-semibold text-slate-200">{user.full_name}</div>
                <div className="text-[10px] text-brand-400 font-mono">
                  {user.profile?.teaching_style || 'Learner'}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <UserIcon size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
