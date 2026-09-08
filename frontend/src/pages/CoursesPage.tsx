import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Cpu,
  Zap,
  Activity,
  Play,
  Clock,
  Sparkles,
  Filter,
  GraduationCap,
  ArrowRight,
  BookMarked,
  CheckCircle2,
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
  stages?: string[];
}

const ECE_COURSES: Course[] = [
  {
    id: 'pcb-design',
    slug: 'pcb-design',
    title: 'PCB Design & Hardware Engineering',
    subject: 'PCB Design',
    level: 'All Stages',
    duration: '25 Mins',
    sections_count: 3,
    description: 'Master schematic netlists, 4-layer stackups, impedance-controlled trace routing, Design Rule Checks (DRC), and manufacturing Gerber exports.',
    icon: 'Layers',
    color: 'purple',
    featured: true,
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    id: 'matlab-simulink',
    slug: 'matlab-simulink',
    title: 'MATLAB & Simulink Dynamic Systems',
    subject: 'MATLAB',
    level: 'All Stages',
    duration: '30 Mins',
    sections_count: 3,
    description: 'Master matrix vectorization, Fast Fourier Transforms (FFT), digital filter synthesis, and Simulink closed-loop PID control loops.',
    icon: 'Cpu',
    color: 'indigo',
    featured: true,
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    id: 'analog-digital-circuits',
    slug: 'analog-digital-circuits',
    title: 'Analog & Digital Circuits Engineering',
    subject: 'Analog and Digital Circuits',
    level: 'All Stages',
    duration: '25 Mins',
    sections_count: 3,
    description: 'Understand Op-Amp golden rules, MOSFET active biasing, small-signal AC gain, D Flip-Flops, binary counters, and ADC/DAC converters.',
    icon: 'Zap',
    color: 'violet',
    featured: true,
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    id: 'dcd-systems',
    slug: 'dcd-systems',
    title: 'DCD — Digital Circuit Design & FPGA Architecture',
    subject: 'DCD',
    level: 'All Stages',
    duration: '28 Mins',
    sections_count: 3,
    description: 'Master Karnaugh Map minimization, Mealy & Moore FSM controllers, Verilog/VHDL RTL, Static Timing Analysis (STA), and FPGA LUT routing.',
    icon: 'Activity',
    color: 'purple',
    featured: true,
    stages: ['Basic', 'Advance', 'High Level'],
  },
  {
    id: 'ohms-law',
    slug: 'ohms-law',
    title: "Circuit Dynamics & Ohm's Law",
    subject: 'Analog and Digital Circuits',
    level: 'Basic',
    duration: '15 Mins',
    sections_count: 3,
    description: 'Master the fundamental triad: Voltage (V), Current (I), and Resistance (R) with interactive circuit simulation and water pipe analogies.',
    icon: 'Zap',
    color: 'violet',
    featured: false,
    stages: ['Basic'],
  },
];

const FILTER_LABELS = [
  { label: 'All Subjects', value: 'all' },
  { label: 'PCB Design', value: 'PCB Design' },
  { label: 'MATLAB', value: 'MATLAB' },
  { label: 'Analog & Digital Circuits', value: 'Analog and Digital Circuits' },
  { label: 'DCD', value: 'DCD' },
];

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoJudge } = useAuthStore();
  const { setLesson } = useTeachingStore();

  const [courses, setCourses] = useState<Course[]>(ECE_COURSES);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const serverCourses = await demoApi.listCourses();
      if (serverCourses && serverCourses.length > 0) {
        setCourses(serverCourses as any);
      }
    } catch {
      setCourses(ECE_COURSES);
    }
  };

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

  const filteredCourses = courses.filter((c) => {
    const matchSub = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchStage = selectedStageFilter === 'all' || (c.stages && c.stages.includes(selectedStageFilter));
    return matchSub && matchStage;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers size={24} />;
      case 'Cpu': return <Cpu size={24} />;
      case 'Zap': return <Zap size={24} />;
      default: return <Activity size={24} />;
    }
  };

  return (
    <div className="space-y-8 pb-20 pt-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-white border border-purple-100 shadow-purple-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <BookMarked size={14} className="text-purple-600" />
            <span>Interactive Engineering Curricula</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-950">
            ECE Curriculum & Multi-Stage Courses
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-2xl">
            Choose from comprehensive courses designed specifically for Electronics and Computer Engineering. Each subject features structured learning across <strong className="text-purple-700">Basic</strong>, <strong className="text-purple-700">Advance</strong>, and <strong className="text-purple-700">High Level</strong> stages.
          </p>
        </div>

        <button
          onClick={() => handleLaunchCourse('pcb-design', 'Basic')}
          className="purple-gradient-btn px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-purple-md shrink-0"
        >
          <Play size={14} fill="currentColor" />
          <span>Start Instant Class</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Subject Filter */}
        <div className="flex flex-wrap gap-2">
          {FILTER_LABELS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedSubject(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedSubject === tab.value
                  ? 'bg-purple-600 text-white border-purple-600 shadow-purple-sm'
                  : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Filter by Stage:</span>
          <div className="flex rounded-lg border border-purple-200 overflow-hidden">
            {['all', 'Basic', 'Advance', 'High Level'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStageFilter(st)}
                className={`px-3 py-1 transition-colors ${
                  selectedStageFilter === st
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-purple-50'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="purple-white-card p-6 bg-white flex flex-col justify-between group hover:border-purple-300"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-sm">
                  {renderIcon(course.icon)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 flex items-center gap-1">
                    <Clock size={12} />
                    <span>{course.duration}</span>
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-950 group-hover:text-purple-700 transition-colors">
                {course.title}
              </h3>
              <p className="text-xs font-bold text-purple-600 mb-2">{course.subject}</p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                {course.description}
              </p>
            </div>

            {/* Stage Selector Action Bar */}
            <div className="pt-4 border-t border-purple-100 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Launch Difficulty Stage:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(course.stages || ['Basic', 'Advance', 'High Level']).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleLaunchCourse(course.slug, st)}
                    disabled={loadingSlug === `${course.slug}-${st}`}
                    className="py-2 px-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 hover:bg-purple-600 hover:text-white border border-purple-200 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Play size={11} fill="currentColor" />
                    <span>{st}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
