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

  // Derive emotion glow color
  const emotionConfig = {
    explaining: { color: '#0c8ce9', label: 'Explaining', glow: 'from-blue-500/20 to-cyan-500/20' },
    encouraging: { color: '#10b981', label: 'Encouraging', glow: 'from-emerald-500/20 to-teal-500/20' },
    thinking: { color: '#7928ca', label: 'Analyzing', glow: 'from-purple-500/20 to-indigo-500/20' },
    celebratory: { color: '#f5a623', label: 'Mastered!', glow: 'from-amber-500/30 to-yellow-500/30' },
    surprised: { color: '#ff0080', label: 'Insightful Question', glow: 'from-rose-500/20 to-pink-500/20' },
    listening: { color: '#00dfd8', label: 'Listening to Voice...', glow: 'from-cyan-500/30 to-emerald-500/30' },
  }[emotion] || { color: '#0c8ce9', label: 'Guiding', glow: 'from-blue-500/20 to-cyan-500/20' };

  // Re-narrate current section
  const handleReplay = () => {
    if (!lesson) return;
    const sec = lesson.sections[currentSectionIndex];
    if (sec) {
      narrateText(sec.narration_script || sec.explanation_text, emotion);
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-between p-4 rounded-2xl glass-panel border border-brand-500/20 ${className}`}>
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
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {emotionConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAudioEnabled
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 hover:bg-brand-500/30'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title={isAudioEnabled ? 'Mute AI Teacher Voice' : 'Unmute AI Teacher Voice'}
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={handleReplay}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Re-explain this section"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Avatar Graphic Canvas / SVG */}
      <div className="relative w-48 h-48 my-1 flex items-center justify-center">
        {/* Ambient Halo Backdrop */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${emotionConfig.glow} blur-2xl transition-all duration-700 ${
            is_speaking ? 'scale-110 opacity-100' : 'scale-95 opacity-60'
          }`}
        />

        {/* Floating Ring on Talking or Listening */}
        {is_speaking && (
          <div className="absolute inset-0 rounded-full border border-brand-400/40 animate-pulse-glow" />
        )}

        {isListeningMic && (
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        )}

        {/* Vector SVG Avatar */}
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full relative z-10 transition-transform duration-300 ${
            is_speaking ? 'animate-float' : ''
          }`}
        >
          <defs>
            {/* Skin Gradient */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffdfba" />
              <stop offset="100%" stopColor="#f5c298" />
            </linearGradient>

            {/* Hair Gradient */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Teacher Suit Gradient */}
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Teacher Glasses Shimmer */}
            <linearGradient id="glassShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>

          {/* Shoulders / Shirt */}
          <path
            d="M 40 190 C 40 150 70 145 100 145 C 130 145 160 150 160 190 Z"
            fill="url(#suitGrad)"
          />
          {/* Shirt Collar */}
          <polygon points="85,145 100,165 115,145 100,150" fill="#f8fafc" />
          <polygon points="96,155 104,155 102,185 98,185" fill="#f59e0b" />

          {/* Neck */}
          <rect x="88" y="125" width="24" height="25" rx="6" fill="url(#skinGrad)" />

          {/* Head Base */}
          <ellipse cx="100" cy="92" rx="46" ry="50" fill="url(#skinGrad)" />

          {/* Hair Back */}
          <path
            d="M 50 85 C 50 45 70 32 100 32 C 130 32 150 45 150 85 C 150 100 146 115 146 115 C 146 115 142 60 100 60 C 58 60 54 115 54 115 Z"
            fill="url(#hairGrad)"
          />

          {/* Eyebrows */}
          {emotion === 'thinking' ? (
            <>
              {/* Furrowed Eyebrows */}
              <line x1="72" y1="74" x2="88" y2="76" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="112" y1="76" x2="128" y2="74" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : emotion === 'surprised' ? (
            <>
              {/* High Arched Eyebrows */}
              <path d="M 72 70 Q 80 64 88 70" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 112 70 Q 120 64 128 70" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Natural Friendly Eyebrows */}
              <path d="M 72 72 Q 80 68 88 71" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 112 71 Q 120 68 128 72" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Eyes (With Blinking) */}
          {isBlinking ? (
            <>
              {/* Closed Eye Arcs */}
              <path d="M 72 85 Q 80 89 88 85" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 112 85 Q 120 89 128 85" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Eye Whites */}
              <ellipse cx="80" cy="85" rx="8" ry="7" fill="#ffffff" />
              <ellipse cx="120" cy="85" rx="8" ry="7" fill="#ffffff" />

              {/* Iris & Pupils */}
              <circle
                cx={80 + eyeOffset.x}
                cy={85 + eyeOffset.y}
                r="4.5"
                fill="#1e3a8a"
              />
              <circle
                cx={80 + eyeOffset.x}
                cy={85 + eyeOffset.y}
                r="2"
                fill="#090d16"
              />
              <circle cx={81.5 + eyeOffset.x} cy={83.5 + eyeOffset.y} r="1.2" fill="#ffffff" />

              <circle
                cx={120 + eyeOffset.x}
                cy={85 + eyeOffset.y}
                r="4.5"
                fill="#1e3a8a"
              />
              <circle
                cx={120 + eyeOffset.x}
                cy={85 + eyeOffset.y}
                r="2"
                fill="#090d16"
              />
              <circle cx={121.5 + eyeOffset.x} cy={83.5 + eyeOffset.y} r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Smart Teacher Glasses */}
          <rect x="68" y="76" width="24" height="18" rx="6" fill="url(#glassShimmer)" stroke="#38bdf8" strokeWidth="2.2" />
          <rect x="108" y="76" width="24" height="18" rx="6" fill="url(#glassShimmer)" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="92" y1="83" x2="108" y2="83" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="68" y1="83" x2="56" y2="80" stroke="#38bdf8" strokeWidth="1.8" />
          <line x1="132" y1="83" x2="144" y2="80" stroke="#38bdf8" strokeWidth="1.8" />

          {/* Nose */}
          <path d="M 99 92 Q 100 102 96 104 Q 101 105 104 103" stroke="#e09f6e" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Cheeks Blush on Celebratory or Encouraging */}
          {(emotion === 'celebratory' || emotion === 'encouraging') && (
            <>
              <ellipse cx="68" cy="98" rx="6" ry="3.5" fill="rgba(244, 63, 94, 0.25)" />
              <ellipse cx="132" cy="98" rx="6" ry="3.5" fill="rgba(244, 63, 94, 0.25)" />
            </>
          )}

          {/* Mouth (Dynamic Visemes for Speech) */}
          {viseme === 'aa' ? (
            /* Open Talking Mouth */
            <path d="M 88 116 Q 100 134 112 116 Q 100 126 88 116 Z" fill="#881337" stroke="#0f172a" strokeWidth="1.5" />
          ) : viseme === 'ee' ? (
            /* Wide Smiling Mouth */
            <path d="M 86 118 Q 100 126 114 118 Q 100 122 86 118 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          ) : viseme === 'oo' ? (
            /* Rounded O Mouth */
            <ellipse cx="100" cy="119" rx="6" ry="8" fill="#881337" stroke="#0f172a" strokeWidth="1.5" />
          ) : viseme === 'mm' ? (
            /* Closed Lips */
            <path d="M 90 119 Q 100 121 110 119" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : (
            /* Silent Idle Mouth (Smile or Neutral) */
            emotion === 'celebratory' || emotion === 'encouraging' ? (
              <path d="M 88 116 Q 100 126 112 116" stroke="#9f1239" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            ) : emotion === 'thinking' ? (
              <path d="M 91 119 Q 100 118 109 120" stroke="#9f1239" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M 89 118 Q 100 123 111 118" stroke="#9f1239" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            )
          )}
        </svg>
      </div>

      {/* Real-time Audio Waveform Indicator */}
      <div className="flex items-center justify-center gap-1 h-7 my-1 w-full">
        {is_speaking ? (
          <>
            <span className="w-1 bg-brand-400 rounded-full animate-wave-1" />
            <span className="w-1 bg-cyan-400 rounded-full animate-wave-2" />
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-3" />
            <span className="w-1 bg-cyan-400 rounded-full animate-wave-4" />
            <span className="w-1 bg-brand-400 rounded-full animate-wave-5" />
          </>
        ) : isListeningMic ? (
          <div className="flex items-center gap-1.5 text-xs text-cyan-300 animate-pulse">
            <Mic size={14} />
            <span>Listening to student...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>AI Teacher Standing By</span>
          </div>
        )}
      </div>

      {/* Persona Badge */}
      <div className="w-full mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-brand-300 font-medium">
          <Sparkles size={13} />
          {teachingStyle}
        </span>
        <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-mono">
          Viseme: {viseme}
        </span>
      </div>
    </div>
  );
};
