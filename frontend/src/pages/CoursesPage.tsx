import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Cpu, Activity, FlaskConical, Dna,
  Play, BookOpen, Clock, BarChart3, ArrowRight,
  Sparkles, Filter, GraduationCap
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTeachingStore } from '../store/useTeachingStore';
import { demoApi } from '../services/api';

interface Course {
  id: string;
  slug: string;
  title: string;
  subject: string;
  level: string;
  duration: string;
  sections_count: number;
  description: string;
  icon: string;
  color: string;
  featured: boolean;
  visual_type: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap size={28} />,
  Cpu: <Cpu size={28} />,
  Activity: <Activity size={28} />,
  FlaskConical: <FlaskConical size={28} />,
  Dna: <Dna size={28} />,
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; badge: string }> = {
  cyan: {
    bg: 'from-cyan-950/40 to-slate-900/80',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  purple: {
    bg: 'from-purple-950/40 to-slate-900/80',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  emerald: {
    bg: 'from-emerald-950/40 to-slate-900/80',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  amber: {
    bg: 'from-amber-950/40 to-slate-900/80',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  rose: {
    bg: 'from-rose-950/40 to-slate-900/80',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
};

const FILTER_LABELS: { label: string; value: string }[] = [
  { label: 'All Courses', value: 'all' },
  { label: 'Physics', value: 'Physics' },
  { label: 'CS & AI', value: 'Computer Science' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Biology', value: 'Biology' },
];

const STATIC_COURSES: Course[] = [
  {
    id: 'ohms-law', slug: 'ohms-law', title: "Ohm's Law & Circuit Dynamics", subject: 'Physics',
    level: 'Beginner', duration: '15 Mins', sections_count: 3,
    description: 'Master the fundamental triad: Voltage (V), Current (I), and Resistance (R) with interactive circuit simulation and water pipe analogies.',
    icon: 'Zap', color: 'cyan', featured: true, visual_type: 'circuit'
  },
  {
    id: 'neural-networks', slug: 'neural-networks', title: 'Neural Networks & Backpropagation', subject: 'Computer Science',
    level: 'Intermediate', duration: '20 Mins', sections_count: 3,
    description: 'Understand weights, biases, ReLU/Sigmoid activation functions, and gradient descent optimization using visual hill-climbing analogies.',
    icon: 'Cpu', color: 'purple', featured: true, visual_type: 'neural_net'
  },
  {
    id: 'calculus-derivatives', slug: 'calculus-derivatives', title: 'Calculus: Derivatives as Rates of Change', subject: 'Mathematics',
    level: 'Beginner to Intermediate', duration: '15 Mins', sections_count: 3,
    description: 'Understand instantaneous rate of change, tangent slopes, and the power rule with interactive curve secants and speedometer analogies.',
    icon: 'Activity', color: 'emerald', featured: true, visual_type: 'calculus'
  },
  {
    id: 'chemical-bonding', slug: 'chemical-bonding', title: 'Chemical Bonding & Reaction Kinetics', subject: 'Chemistry',
    level: 'Intermediate', duration: '18 Mins', sections_count: 3,
    description: 'Discover collision theory, activation energy barriers, and how catalysts speed up reactions by lowering the energetic mountain.',
    icon: 'FlaskConical', color: 'amber', featured: true, visual_type: 'chemistry'
  },
  {
    id: 'dna-genetics', slug: 'dna-genetics', title: 'DNA Structure, Replication & Central Dogma', subject: 'Biology',
    level: 'Beginner', duration: '16 Mins', sections_count: 3,
    description: 'Explore the double helix architecture, complementary base pairing (A-T, G-C), and semi-conservative replication machinery.',
    icon: 'Dna', color: 'rose', featured: true, visual_type: 'biology'
  },
];

const LEARNING_OBJECTIVES: Record<string, string[]> = {
  'ohms-law': ['Describe voltage as electrical pressure', 'Apply I = V/R to real circuits', 'Explain the inverse relationship between current and resistance'],
  'neural-networks': ['Compute the weighted sum z = Σwᵢxᵢ + b', 'Apply ReLU and Sigmoid activations', 'Understand backpropagation and gradient descent'],
  'calculus-derivatives': ['Distinguish average vs instantaneous rate of change', 'Apply the limit definition of the derivative', 'Use the power rule to compute f\'(x)'],
  'chemical-bonding': ['Contrast ionic and covalent bonding mechanisms', 'Explain Collision Theory and activation energy', 'Describe how catalysts lower the activation barrier'],
  'dna-genetics': ['Identify complementary base pairing (A-T, G-C)', 'Trace the semi-conservative replication process', 'Explain the Central Dogma: DNA → RNA → Protein'],
};

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();
  const [courses, setCourses] = useState<Course[]>(STATIC_COURSES);
  const [filter, setFilter] = useState('all');
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    demoApi.listCourses()
      .then(data => setCourses(data.length > 0 ? data : STATIC_COURSES))
      .catch(() => {/* use static fallback */});
  }, []);

  const handleStartCourse = async (slug: string) => {
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

  const filtered = filter === 'all' ? courses : courses.filter(c => c.subject === filter);

  return (
    <div className="min-h-screen bg-mesh-pattern pb-20">
      {/* Hero */}
      <section className="relative pt-14 pb-12 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <GraduationCap size={14} className="text-cyan-400" />
          <span>Full Multi-Subject Curriculum Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white max-w-3xl mx-auto leading-[1.1]">
          5 Complete{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Interactive Courses
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Each course features rich pedagogical lessons, domain-specific interactive simulators,
          misconception detection, and diagnostic checkpoints — all ready in one click.
        </p>

        {/* Stats bar */}
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          {[['5', 'Courses'], ['15', 'Sections'], ['15+', 'Questions'], ['5', 'Simulators']].map(([n, l]) => (
            <div key={l} className="flex flex-col items-center">
              <span className="text-xl font-black font-mono text-brand-300">{n}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-slate-500 shrink-0" />
          {FILTER_LABELS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === f.value
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 text-xs text-slate-500 font-mono">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Course Grid */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(course => {
            const colors = COLOR_MAP[course.color] || COLOR_MAP['cyan'];
            const objectives = LEARNING_OBJECTIVES[course.slug] || [];
            const isExpanded = expandedId === course.id;
            const isLoading = loadingSlug === course.slug;

            return (
              <div
                key={course.id}
                className={`relative flex flex-col rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} overflow-hidden shadow-xl ${colors.glow} transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group`}
              >
                {course.featured && (
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl bg-brand-500 text-white`}>
                    ★ Featured
                  </div>
                )}

                <div className="p-6">
                  {/* Icon + Subject */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.badge} border shadow-lg`}>
                      <span className={colors.text}>{ICON_MAP[course.icon]}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${colors.text}`}>
                        {course.subject}
                      </span>
                      <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.badge} border w-fit ml-auto`}>
                        {course.level}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-bold text-white group-hover:text-brand-200 transition-colors leading-snug mb-2">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {course.sections_count} Sections
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      Interactive Sim
                    </span>
                  </div>

                  {/* Expandable Objectives */}
                  {objectives.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : course.id)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Sparkles size={12} className={colors.text} />
                        <span>Learning Objectives</span>
                        <ArrowRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      {isExpanded && (
                        <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                          {objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colors.text} bg-current`} />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Footer */}
                <div className="mt-auto p-4 pt-0 border-t border-white/5">
                  <button
                    id={`start-course-${course.slug}`}
                    onClick={() => handleStartCourse(course.slug)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all ${isLoading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                      } bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-lg shadow-brand-500/25`}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play size={15} className="fill-white" />
                    )}
                    {isLoading ? 'Loading Classroom...' : 'Start Learning Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No courses found for this filter.</p>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-slate-800/80">
        <h2 className="text-2xl font-display font-bold text-white mb-3">
          Want to teach your own material?
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Upload a PDF or PPTX document and EDUVATAR AI will generate a full personalized curriculum,
          complete with sections, demonstrations, and diagnostic questions — grounded in your textbook.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/curriculum')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
          >
            <Sparkles size={16} />
            Create Custom Curriculum
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
          >
            <BookOpen size={16} />
            Upload Your Documents
          </button>
        </div>
      </section>
    </div>
  );
};
