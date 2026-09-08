import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Mic, Smile, Award } from 'lucide-react';
import { useTeachingStore } from '../../store/useTeachingStore';

interface TeacherAvatarProps {
  teachingStyle?: string;
  className?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  teachingStyle = 'Friendly Mentor',
  className = '',
}) => {
  const {
    avatarState,
    isAudioEnabled,
    toggleAudio,
    narrateText,
    lesson,
    currentSectionIndex,
    isListeningMic,
  } = useTeachingStore();

  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle pupil tracking / natural gaze shifts
  useEffect(() => {
    const gazeInterval = setInterval(() => {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 3;
      setEyeOffset({ x, y });
    }, 3000);

    return () => clearInterval(gazeInterval);
  }, []);

  const { emotion, is_speaking, viseme } = avatarState;

  // Emotion config in Purple & White palette
  const emotionConfig = {
    explaining: { color: '#7c3aed', label: 'Explaining', glow: 'from-purple-500/20 to-indigo-500/20' },
    encouraging: { color: '#10b981', label: 'Encouraging', glow: 'from-emerald-500/20 to-teal-500/20' },
    thinking: { color: '#9333ea', label: 'Analyzing', glow: 'from-violet-500/20 to-purple-500/20' },
    celebratory: { color: '#f59e0b', label: 'Mastered!', glow: 'from-amber-500/30 to-yellow-500/30' },
    surprised: { color: '#f43f5e', label: 'Great Question', glow: 'from-rose-500/20 to-pink-500/20' },
    listening: { color: '#6366f1', label: 'Listening to Voice...', glow: 'from-indigo-500/30 to-purple-500/30' },
  }[emotion] || { color: '#7c3aed', label: 'Guiding', glow: 'from-purple-500/20 to-indigo-500/20' };

  // Re-narrate current section
  const handleReplay = () => {
    if (!lesson) return;
    const sec = lesson.sections[currentSectionIndex];
    if (sec) {
      narrateText(sec.narration_script || sec.explanation_text, emotion);
    }
  };

  return (
    <div className={`purple-white-card p-4 bg-white flex flex-col items-center justify-between border-purple-200 ${className}`}>
      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`}
              style={{ backgroundColor: emotionConfig.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: emotionConfig.color }}
            />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {emotionConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAudioEnabled
                ? 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
            title={isAudioEnabled ? 'Mute Natural Voice' : 'Unmute Natural Voice'}
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={handleReplay}
            disabled={!lesson}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-40"
            title="Replay Voice Explanation"
          >
            <RefreshCw size={16} className={is_speaking ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* SVG Talking Canvas Avatar */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${emotionConfig.glow} blur-2xl transition-all duration-700`}
        />

        <svg
          viewBox="0 0 200 200"
          className="relative z-10 w-full h-full drop-shadow-md select-none"
        >
          <defs>
            <linearGradient id="teacherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f5f3ff" />
            </linearGradient>
          </defs>

          {/* Teacher Torso / Robe */}
          <path
            d="M 40 200 C 40 150, 60 140, 100 140 C 140 140, 160 150, 160 200 Z"
            fill="url(#teacherGrad)"
          />

          {/* Academic Collar & Pin */}
          <path
            d="M 85 140 L 100 162 L 115 140 Z"
            fill="#ffffff"
          />
          <circle cx="100" cy="168" r="4" fill="#fbbf24" />

          {/* Head & Neck */}
          <rect x="90" y="115" width="20" height="30" rx="6" fill="#fdedd0" />
          <ellipse cx="100" cy="85" rx="42" ry="48" fill="#fff5ea" stroke="#e9d5ff" strokeWidth="1.5" />

          {/* Hair & Cap */}
          <path
            d="M 58 75 C 58 40, 142 40, 142 75 C 135 60, 65 60, 58 75 Z"
            fill="#3b0764"
          />
          {/* Glasses Frame (Academic Look) */}
          <g transform="translate(0, 0)">
            <rect x="68" y="74" width="26" height="20" rx="6" fill="none" stroke="#6b21a8" strokeWidth="2.5" />
            <rect x="106" y="74" width="26" height="20" rx="6" fill="none" stroke="#6b21a8" strokeWidth="2.5" />
            <line x1="94" y1="84" x2="106" y2="84" stroke="#6b21a8" strokeWidth="2.5" />
          </g>

          {/* Eyes (Tracking & Blinking) */}
          {isBlinking ? (
            <g stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="74" y1="84" x2="88" y2="84" />
              <line x1="112" y1="84" x2="126" y2="84" />
            </g>
          ) : (
            <g>
              <ellipse cx="81" cy="84" rx="6" ry="6" fill="#ffffff" />
              <ellipse cx="119" cy="84" rx="6" ry="6" fill="#ffffff" />
              <circle
                cx={81 + eyeOffset.x}
                cy={84 + eyeOffset.y}
                r="3.5"
                fill="#1e1b4b"
              />
              <circle
                cx={119 + eyeOffset.x}
                cy={84 + eyeOffset.y}
                r="3.5"
                fill="#1e1b4b"
              />
              {/* Pupil highlights */}
              <circle cx={80} cy={82} r="1" fill="#ffffff" />
              <circle cx={118} cy={82} r="1" fill="#ffffff" />
            </g>
          )}

          {/* Eyebrows (Emotion adaptive) */}
          <g stroke="#3b0764" strokeWidth="2.5" strokeLinecap="round">
            {emotion === 'thinking' ? (
              <>
                <line x1="72" y1="72" x2="88" y2="70" />
                <line x1="112" y1="70" x2="128" y2="75" />
              </>
            ) : emotion === 'surprised' ? (
              <>
                <path d="M 72 70 Q 80 64 88 70" fill="none" />
                <path d="M 112 70 Q 120 64 128 70" fill="none" />
              </>
            ) : (
              <>
                <path d="M 72 73 Q 80 70 88 73" fill="none" />
                <path d="M 112 73 Q 120 70 128 73" fill="none" />
              </>
            )}
          </g>

          {/* Dynamic Viseme Mouth */}
          <g className="viseme-mouth">
            {is_speaking ? (
              viseme === 'aa' ? (
                <ellipse cx="100" cy="112" rx="11" ry="8" fill="#be123c" stroke="#881337" strokeWidth="1.5" />
              ) : viseme === 'oo' ? (
                <ellipse cx="100" cy="112" rx="7" ry="9" fill="#be123c" stroke="#881337" strokeWidth="1.5" />
              ) : viseme === 'ee' ? (
                <path d="M 90 110 Q 100 118 110 110 Z" fill="#be123c" stroke="#881337" strokeWidth="1.5" />
              ) : viseme === 'mm' ? (
                <line x1="92" y1="112" x2="108" y2="112" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d="M 92 110 Q 100 117 108 110" fill="none" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
              )
            ) : (
              <path d="M 93 111 Q 100 116 107 111" fill="none" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>
        </svg>
      </div>

      {/* Teacher Status & Style Badge */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-purple-100 text-xs text-slate-700">
        <span className="font-bold flex items-center gap-1">
          <Sparkles size={13} className="text-purple-600" />
          <span>{teachingStyle}</span>
        </span>
        <span className="font-semibold text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {is_speaking ? 'Speaking Natural Voice' : 'Ready'}
        </span>
      </div>
    </div>
  );
};
