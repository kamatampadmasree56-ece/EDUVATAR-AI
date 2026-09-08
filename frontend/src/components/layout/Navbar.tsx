import React, { useState } from 'react';
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
  Mic,
  Volume2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeachingStore } from '../../store/useTeachingStore';
import { demoApi } from '../../services/api';
import { speechService, VoiceGender } from '../../services/speechService';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();
  const [voiceMode, setVoiceMode] = useState<VoiceGender>('natural-female');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

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

  const handleVoiceChange = (gender: VoiceGender) => {
    setVoiceMode(gender);
    speechService.selectedGender = gender;
    setShowVoiceMenu(false);
    // Preview sample speech
    const sampleText = gender === 'natural-female'
      ? "Natural Human Teacher voice enabled. Ready for class!"
      : "Natural Male Professor voice enabled. Let's begin.";
    speechService.speak(sampleText, { gender });
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
    <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/90 backdrop-blur-xl shadow-purple-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-royal-500 to-indigo-500 p-[2px] shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <GraduationCap className="text-purple-600 group-hover:scale-110 transition-transform" size={22} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-tight text-slate-950">
                EDUVATAR<span className="text-purple-600 font-extrabold ml-1">AI</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-widest font-mono">
                ECE ADAPTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              PCB • MATLAB • Analog/Digital Circuits • DCD
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm'
                    : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50/80'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-purple-600' : 'text-slate-500'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Voice Toggle & Demo Button */}
        <div className="flex items-center gap-2.5">
          {/* Natural Voice Selector */}
          <div className="relative">
            <button
              onClick={() => setShowVoiceMenu(!showVoiceMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 transition-colors shadow-sm"
              title="Select Natural Human AI Voice"
            >
              <Volume2 size={14} className="text-purple-600" />
              <span className="hidden sm:inline">
                {voiceMode === 'natural-female' ? 'Natural Voice (F)' : 'Natural Voice (M)'}
              </span>
            </button>

            {showVoiceMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-purple-100 rounded-xl shadow-purple-md p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">AI Voice Tone</p>
                <button
                  onClick={() => handleVoiceChange('natural-female')}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between ${
                    voiceMode === 'natural-female' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Natural Female (Warm)</span>
                  {voiceMode === 'natural-female' && <span className="text-purple-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => handleVoiceChange('natural-male')}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between mt-1 ${
                    voiceMode === 'natural-male' ? 'bg-purple-100 text-purple-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Natural Male (Clear)</span>
                  {voiceMode === 'natural-male' && <span className="text-purple-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Quick Classroom Launcher */}
          <button
            onClick={handleLaunchJudgeDemo}
            className="purple-gradient-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs"
          >
            <Play size={13} fill="currentColor" />
            <span>Launch Classroom</span>
          </button>

          {/* User Auth or Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-purple-100">
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.full_name}</span>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors"
              title="Sign In"
            >
              <UserIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
