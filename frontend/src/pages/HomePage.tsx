import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Zap,
  Layers,
  Cpu,
  Activity,
  ArrowRight,
  CheckCircle2,
  FileText,
  UploadCloud,
  GraduationCap,
  ShieldCheck,
  Volume2,
  Sliders,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTeachingStore } from '../store/useTeachingStore';
import { demoApi, lessonApi } from '../services/api';

const ECE_COURSES = [
  {
    slug: 'pcb-design',
    title: 'PCB Design & Hardware Engineering',
    subject: 'PCB Design',
    desc: 'Master schematic netlists, 4-layer stackups, trace impedance routing, DRC verification, and Gerber exports.',
    icon: <Layers size={22} />,
    color: 'purple',
    duration: '25 Mins',
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    slug: 'matlab-simulink',
    title: 'MATLAB & Simulink System Modeling',
    subject: 'MATLAB',
    desc: 'Master matrix vectorization, FFT spectral analysis, digital filter design, and Simulink closed-loop PID controllers.',
    icon: <Cpu size={22} />,
    color: 'indigo',
    duration: '30 Mins',
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    slug: 'analog-digital-circuits',
    title: 'Analog & Digital Circuits Engineering',
    subject: 'Analog and Digital Circuits',
    desc: 'Explore Op-Amps, MOSFET small-signal amplifiers, active filters, D Flip-Flops, synchronous counters, and ADC/DAC.',
    icon: <Zap size={22} />,
    color: 'violet',
    duration: '25 Mins',
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    slug: 'dcd-systems',
    title: 'DCD — Digital Circuit Design & FPGA',
    subject: 'DCD',
    desc: 'Master K-Map optimization, Mealy vs. Moore State Machines, Verilog/VHDL RTL, Static Timing Analysis (STA), and FPGA LUTs.',
    icon: <Activity size={22} />,
    color: 'purple',
    duration: '28 Mins',
    stages: ['Basic', 'Advance', 'High Level'],
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedStage, setSelectedStage] = useState<'Basic' | 'Advance' | 'High Level'>('Basic');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLaunchCourse = async (slug: string, stage: string = 'Basic') => {
    setLoadingSlug(`${slug}-${stage}`);
    try {
      await loginAsDemoJudge();
      const lesson = await demoApi.startCourse(slug);
      setLesson(lesson);
      navigate('/teach');
    } catch {
      navigate('/teach');
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleTeachTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setIsGenerating(true);
    try {
      await loginAsDemoJudge();
      const newLesson = await lessonApi.generateLesson({
        title: `${customTopic} (${selectedStage} Stage)`,
        topic: customTopic,
        target_level: selectedStage,
        duration_minutes: 25,
        learning_mode: 'complete_learning',
      });
      setLesson(newLesson);
      navigate('/teach');
    } catch {
      navigate('/teach');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-14 pb-20 pt-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Section with Purple & White Aesthetic */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-white border border-purple-100 shadow-purple-md">
        {/* Subtle background glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/40 via-violet-100/30 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-gradient-to-tr from-royal-200/30 via-purple-100/20 to-transparent rounded-full blur-2xl -z-0 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles size={14} className="text-purple-600 animate-pulse" />
              <span>Adaptive AI Educator for Electronics & Circuits</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Don’t Just Ask AI. <br />
              <span className="bg-gradient-to-r from-purple-700 via-royal-600 to-indigo-600 bg-clip-text text-transparent">
                Let AI Teach You ECE.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed max-w-2xl">
              The human-like adaptive educator for <strong className="font-semibold text-slate-900">PCB Design</strong>, <strong className="font-semibold text-slate-900">MATLAB</strong>, <strong className="font-semibold text-slate-900">Analog & Digital Circuits</strong>, and <strong className="font-semibold text-slate-900">DCD</strong>. Features natural human voice, interactive whiteboards, and structured depth across <span className="text-purple-700 font-bold">Basic</span>, <span className="text-purple-700 font-bold">Advance</span>, and <span className="text-purple-700 font-bold">High Level</span> stages.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleLaunchCourse('pcb-design', 'Basic')}
                className="purple-gradient-btn px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                <span>Start PCB Design Class</span>
              </button>

              <button
                onClick={() => navigate('/documents')}
                className="purple-outline-btn px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm"
              >
                <UploadCloud size={16} className="text-purple-600" />
                <span>Drop & Drag PDF / Folder</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 pt-3 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-purple-600" />
                <span>Natural Human Voice</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-purple-600" />
                <span>Basic, Advance & High Level</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-purple-600" />
                <span>Instant PDF Simplifier</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Topic Generator Card */}
          <div className="lg:col-span-5">
            <div className="purple-white-card p-6 border-purple-200 bg-white relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Custom Engineering Lesson</h3>
                    <p className="text-[11px] text-slate-500">AI builds a step-by-step interactive lesson</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Instant AI
                </span>
              </div>

              <form onSubmit={handleTeachTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter any Topic or Circuit Concept:
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. 4-Layer PCB Stackup, Mealy FSM, Op-Amp Active Filters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Depth Stage:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Basic', 'Advance', 'High Level'] as const).map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedStage(stage)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                          selectedStage === stage
                            ? 'bg-purple-600 text-white border-purple-600 shadow-purple-sm'
                            : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !customTopic.trim()}
                  className="w-full purple-gradient-btn py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span>Synthesizing Classroom...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Teach Me This with Avatar</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Core Subjects Section (PCB Design, MATLAB, Analog/Digital, DCD) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <Zap size={15} />
              <span>Curriculum & Specialized Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 mt-1">
              Explore ECE Subjects by Stage
            </h2>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>View All Courses & Roadmaps</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 ECE Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ECE_COURSES.map((course) => (
            <div
              key={course.slug}
              className="purple-white-card p-6 bg-white flex flex-col justify-between group hover:border-purple-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-sm">
                    {course.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800">
                    {course.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-950 group-hover:text-purple-700 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs font-semibold text-purple-600 mb-2">{course.subject}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal mb-5">
                  {course.desc}
                </p>
              </div>

              {/* Stage Launch Buttons */}
              <div className="pt-4 border-t border-purple-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Difficulty Stage to Begin:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {course.stages.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleLaunchCourse(course.slug, st)}
                      disabled={loadingSlug === `${course.slug}-${st}`}
                      className="py-1.5 px-2 rounded-lg text-xs font-bold bg-purple-50 text-purple-900 hover:bg-purple-600 hover:text-white border border-purple-200 transition-all flex items-center justify-center gap-1"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PDF & Folder Drag-and-Drop Callout */}
      <section className="rounded-2xl p-8 bg-gradient-to-r from-purple-900 via-royal-900 to-indigo-950 text-white shadow-purple-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-400/30 text-purple-200 text-xs font-bold">
            <UploadCloud size={14} />
            <span>Multi-File & Folder Analyzer</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Upload Any ECE PDF or Folder for Instant Simple Explanation
          </h3>
          <p className="text-sm text-purple-100 leading-relaxed">
            Drag & drop entire folders of lecture notes, data sheets, or research papers. The AI extracts the core topic, translates complex jargon into everyday simple analogies, highlights main points, and creates a live avatar lesson instantly.
          </p>
        </div>

        <button
          onClick={() => navigate('/documents')}
          className="whitespace-nowrap px-6 py-3.5 rounded-xl bg-white text-purple-950 font-bold text-sm shadow-xl hover:bg-purple-50 transition-transform hover:scale-105 flex items-center gap-2"
        >
          <UploadCloud size={18} className="text-purple-700" />
          <span>Go to Drag & Drop Hub</span>
        </button>
      </section>
    </div>
  );
};
