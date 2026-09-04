import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Zap,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Cpu,
  Activity,
  FlaskConical,
  Dna,
  BookMarked,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTeachingStore } from '../store/useTeachingStore';
import { demoApi, lessonApi } from '../services/api';

const ALL_COURSES = [
  {
    slug: 'ohms-law', title: "Ohm's Law & Circuit Dynamics", subject: 'Physics & Electrical',
    desc: 'Master Voltage, Current, and Resistance with interactive circuit simulation and water pipe analogies.',
    icon: <Zap size={20} />, iconColor: 'text-cyan-400', borderColor: 'border-cyan-500/30',
    duration: '15 Mins', sections: 3, featured: true,
  },
  {
    slug: 'neural-networks', title: 'Neural Networks & Backpropagation', subject: 'Computer Science & AI',
    desc: 'Discover gradient descent, weights, biases, and activation functions using visual hill-climbing analogies.',
    icon: <Cpu size={20} />, iconColor: 'text-purple-400', borderColor: 'border-purple-500/30',
    duration: '20 Mins', sections: 3, featured: false,
  },
  {
    slug: 'calculus-derivatives', title: 'Calculus: Derivatives as Rates of Change', subject: 'Mathematics',
    desc: 'Understand instantaneous rates of change, tangent lines, and limits with speedometer demonstrations.',
    icon: <Activity size={20} />, iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/30',
    duration: '15 Mins', sections: 3, featured: false,
  },
  {
    slug: 'chemical-bonding', title: 'Chemical Bonding & Reaction Kinetics', subject: 'Chemistry',
    desc: 'Discover collision theory, activation energy barriers, and how catalysts lower the energetic mountain.',
    icon: <FlaskConical size={20} />, iconColor: 'text-amber-400', borderColor: 'border-amber-500/30',
    duration: '18 Mins', sections: 3, featured: false,
  },
  {
    slug: 'dna-genetics', title: 'DNA Structure, Replication & Central Dogma', subject: 'Biology & Genetics',
    desc: 'Explore the double helix, complementary base pairing (A-T, G-C), and semi-conservative replication.',
    icon: <Dna size={20} />, iconColor: 'text-rose-400', borderColor: 'border-rose-500/30',
    duration: '16 Mins', sections: 3, featured: false,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLaunchCourse = async (slug: string) => {
    setLoadingSlug(slug);
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

  const handleLaunchJudgeDemo = () => handleLaunchCourse('ohms-law');

  const handleTeachCompleteTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setIsGenerating(true);
    try {
      await loginAsDemoJudge();
      const newLesson = await lessonApi.generateLesson({
        title: `Complete Topic: ${customTopic}`,
        topic: customTopic,
        target_level: 'Beginner',
        duration_minutes: 60,
        learning_mode: 'complete_learning'
      });
      setLesson(newLesson);
      navigate('/teach');
    } catch {
      navigate('/teach');
    } finally {
      setIsGenerating(false);
    }
  };

  const pedagogicalSteps = [
    { step: 1, title: 'Understand', desc: 'Analyzes your learner profile, prior gaps, and learning pace.' },
    { step: 2, title: 'Plan', desc: 'Constructs a progressive, multi-tiered modular curriculum.' },
    { step: 3, title: 'Explain', desc: 'Articulates intuitive breakdowns with voice narration.' },
    { step: 4, title: 'Demonstrate', desc: 'Simulates concepts with interactive circuits, models & KaTeX.' },
    { step: 5, title: 'Question', desc: 'Tests comprehension at every section with diagnostic checkpoints.' },
    { step: 6, title: 'Evaluate', desc: 'Analyzes your answer and pinpoints exact misconceptions.' },
    { step: 7, title: 'Adapt', desc: 'Switches to simpler analogies, slower pacing, or step-by-step logic.' },
    { step: 8, title: 'Continue', desc: 'Celebrates mastery milestones, updates radar metrics, and progresses.' },
  ];

  const comparison = [
    {
      feature: 'Pedagogical Role',
      chatbot: 'Passive answer bot; gives answers away without checking understanding',
      eduvatar: 'Active human-like teacher that questions, guides, tests, and coaches',
    },
    {
      feature: 'Misconception Handling',
      chatbot: 'Cannot detect student cognitive gaps or faulty mental models',
      eduvatar: 'Pinpoints specific misconceptions & prescribes targeted real-world analogies',
    },
    {
      feature: 'Demonstration',
      chatbot: 'Wall of dry plain text',
      eduvatar: 'Interactive circuit labs, KaTeX formula derivations, and water-pipe visual analogies',
    },
    {
      feature: 'Voice & Presence',
      chatbot: 'Silent or robotic text-to-speech without emotion',
      eduvatar: 'Living animated vector avatar with viseme lip sync, breathing, and emotions',
    },
    {
      feature: 'Assessment & Feedback',
      chatbot: 'None; conversation is forgotten once browser tab closes',
      eduvatar: 'Diagnostic report cards, mastery radar charts, and personalized learning roadmaps',
    },
  ];

  return (
    <div className="min-h-screen bg-mesh-pattern pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Interactive AI Educator Showcase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Don't just ask AI.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Let AI teach you.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Standard chatbots give answers. <strong>EDUVATAR AI</strong> teaches like an inspiring mentor: planning lessons, explaining with voice, demonstrating with interactive labs, asking diagnostic questions, identifying misconceptions, and adapting to your pace.
        </p>

        {/* Complete Topic Custom Teaching Form */}
        <form onSubmit={handleTeachCompleteTopic} className="mt-8 max-w-xl mx-auto flex items-center gap-2 p-2 rounded-2xl glass-panel border border-brand-500/40 shadow-2xl">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Type ANY topic... (e.g. Operating Systems, Neural Networks, Calculus)"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !customTopic.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shrink-0"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            <span>{isGenerating ? 'Decomposing Topic...' : 'Teach Complete Topic'}</span>
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleLaunchJudgeDemo}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <Play size={16} className="fill-white text-cyan-400" />
            <span>Launch Ohm's Law Classroom</span>
          </button>

          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <BookMarked size={16} className="text-brand-400" />
            <span>Browse 5 Course Catalogs</span>
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-cyan-400 block mb-0.5">Animated Avatar</span>
            <span className="text-slate-400">Natural breathing, blinking & lip sync visemes</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-emerald-400 block mb-0.5">5 Interactive Labs</span>
            <span className="text-slate-400">Circuit, Neural Net, Calculus, Chemistry, DNA</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-amber-400 block mb-0.5">Misconception AI</span>
            <span className="text-slate-400">Diagnoses mental gaps and remedies with analogies</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="font-bold text-purple-400 block mb-0.5">RAG Grounded</span>
            <span className="text-slate-400">Upload PDF/PPTX for textbook-cited teaching</span>
          </div>
        </div>
      </section>

      {/* 8-Step Pedagogical Loop */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
            The 8-Step Adaptive Pedagogical Loop
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Teaching is not answering questions. It is a systematic, human-like cognitive cycle designed for deep conceptual retention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pedagogicalSteps.map((s) => (
            <div key={s.step} className="p-5 rounded-2xl glass-card relative overflow-hidden group hover:border-brand-500/40">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 font-mono font-bold flex items-center justify-center text-xs mb-3 border border-brand-500/30">
                0{s.step}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>{s.title}</span>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
            Why Standard AI Fails at Teaching
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            When you ask an LLM a question, it just outputs the solution. Here is how EDUVATAR AI bridges the education gap:
          </p>
        </div>

        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-slate-900/90 p-4 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            <div className="col-span-3">Dimension</div>
            <div className="col-span-4 text-rose-400 flex items-center gap-1.5">
              <XCircle size={14} /><span>Standard Chatbot</span>
            </div>
            <div className="col-span-5 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} /><span>EDUVATAR AI Teacher</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {comparison.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 items-center gap-2 hover:bg-slate-900/40 transition-colors">
                <div className="col-span-3 font-semibold text-slate-200">{item.feature}</div>
                <div className="col-span-4 text-slate-400">{item.chatbot}</div>
                <div className="col-span-5 text-emerald-200 font-medium bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20">
                  {item.eduvatar}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 5 Courses */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Curriculums Ready to Teach
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              5 complete courses — Physics, CS/AI, Math, Chemistry & Biology — each with interactive simulations.
            </p>
          </div>
          <button onClick={() => navigate('/courses')} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold">
            <span>View Course Catalog</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ALL_COURSES.map((course) => {
            const isLoading = loadingSlug === course.slug;
            return (
              <div key={course.slug} className={`p-5 rounded-2xl glass-card border ${course.borderColor} flex flex-col justify-between space-y-4 relative overflow-hidden group`}>
                {course.featured && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-brand-500 text-[10px] font-bold text-white uppercase tracking-wider rounded-bl-xl">
                    Judge Recommended
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={course.iconColor}>{course.icon}</span>
                    <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${course.iconColor}`}>
                      {course.subject}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{course.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-500">{course.sections} Sections • {course.duration}</span>
                  <button
                    id={`home-start-${course.slug}`}
                    onClick={() => handleLaunchCourse(course.slug)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.03]'} ${course.featured ? 'bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                  >
                    {isLoading ? (
                      <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Play size={12} className={course.featured ? 'fill-white' : ''} />
                    )}
                    <span>{isLoading ? 'Loading...' : 'Start Lesson'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
