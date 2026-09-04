import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, Sparkles, Bot, User, Lightbulb } from 'lucide-react';
import { useTeachingStore } from '../../store/useTeachingStore';

export const TeacherDoubtChat: React.FC = () => {
  const {
    chatMessages,
    askDoubt,
    isAsking,
    isListeningMic,
    startListeningMic,
    stopListeningMic,
  } = useTeachingStore();

  const [inputQuery, setInputQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  const handleSend = async () => {
    if (!inputQuery.trim() || isAsking) return;
    const query = inputQuery.trim();
    setInputQuery('');
    await askDoubt(query);
  };

  const handleQuickQuestion = async (q: string) => {
    if (isAsking) return;
    await askDoubt(q);
  };

  const toggleMic = () => {
    if (isListeningMic) {
      stopListeningMic();
    } else {
      startListeningMic((transcript) => {
        setInputQuery(transcript);
      });
    }
  };

  const quickPrompts = [
    "Why does current decrease when resistance increases?",
    "Can you give me another analogy for Voltage?",
    "What happens if resistance drops to zero?",
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-200">Interactive Doubt & Clarification Dock</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
          Live Teacher Q&A
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[360px]">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'teacher' && (
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={13} className="text-brand-300" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{msg.text}</p>

              {msg.analogy && (
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-1.5 mt-1">
                  <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Analogy: </strong>
                    {msg.analogy}
                  </span>
                </div>
              )}

              <div className={`text-[9px] ${msg.role === 'user' ? 'text-brand-200' : 'text-slate-500'} text-right font-mono`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User size={13} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isAsking && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center shrink-0">
              <Bot size={13} className="text-brand-300" />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] text-slate-400">Teacher is explaining...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0 text-[9px] ml-1">
          Try Asking:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickQuestion(prompt)}
            className="shrink-0 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Query Input Box */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={toggleMic}
          className={`p-2 rounded-xl border transition-colors ${
            isListeningMic
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
              : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
          }`}
          title="Voice input"
        >
          <Mic size={15} />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your AI Teacher any doubt or question..."
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />

        <button
          onClick={handleSend}
          disabled={!inputQuery.trim() || isAsking}
          className={`p-2 rounded-xl text-white transition-all ${
            !inputQuery.trim() || isAsking
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              : 'bg-brand-500 hover:bg-brand-400 shadow-md shadow-brand-500/20'
          }`}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
