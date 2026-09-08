import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, Sparkles, Bot, User, Lightbulb } from 'lucide-react';
import { useTeachingStore } from '../../store/useTeachingStore';

interface TeacherDoubtChatProps {
  lessonId?: number;
  currentSectionIndex?: number;
}

export const TeacherDoubtChat: React.FC<TeacherDoubtChatProps> = () => {
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
    'Can you give me a simple real-world analogy for this concept?',
    'What are the most common beginner mistakes in this topic?',
    'How is this verified in real-world industry applications?',
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden text-slate-900">
      {/* Header */}
      <div className="p-3 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-purple-600" />
          <span className="text-xs font-bold text-slate-900">
            Ask AI Teacher (Voice & Chat)
          </span>
        </div>
        <span className="text-[10px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-mono font-bold">
          Socratic AI Educator
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[340px]">
        {chatMessages.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Bot size={24} className="text-purple-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              Have a question about this section?
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Ask any doubt via voice microphone or text. Your AI teacher will answer with plain English analogies!
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'teacher' && (
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={13} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none font-medium'
                    : 'bg-purple-50/60 border border-purple-200 text-slate-900 rounded-tl-none font-medium'
                }`}
              >
                <p>{msg.text}</p>

                {msg.analogy && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-1.5 mt-1">
                    <Lightbulb size={13} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Analogy: </strong>
                      {msg.analogy}
                    </span>
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    msg.role === 'user' ? 'text-purple-200' : 'text-slate-400'
                  } text-right font-mono`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          ))
        )}

        {isAsking && (
          <div className="flex gap-2 items-center text-xs font-bold text-purple-700 p-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
            <span>AI Teacher is thinking of the best explanation...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-purple-50/40 border-t border-purple-100 flex flex-wrap gap-1.5">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickQuestion(q)}
            disabled={isAsking}
            className="text-[10px] font-semibold bg-white hover:bg-purple-100 text-purple-900 px-2 py-1 rounded-lg border border-purple-200 transition-colors shadow-sm disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-purple-100 flex items-center gap-2">
        <button
          onClick={toggleMic}
          className={`p-2 rounded-xl border transition-colors ${
            isListeningMic
              ? 'bg-rose-100 border-rose-400 text-rose-700 animate-pulse'
              : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
          }`}
          title="Voice Ask"
        >
          <Mic size={15} />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question or request a simple analogy..."
          className="flex-1 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
        />

        <button
          onClick={handleSend}
          disabled={!inputQuery.trim() || isAsking}
          className="purple-gradient-btn p-2 rounded-xl text-xs disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
