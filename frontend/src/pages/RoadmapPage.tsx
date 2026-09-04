import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { learningPathApi } from '../services/api';
import { LearningPath, RoadmapNode } from '../types';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    learningPathApi
      .getSubjectPath('Physics')
      .then((data) => {
        setRoadmap(data);
        if (data.nodes.length > 0) {
          setSelectedNode(data.nodes[1] || data.nodes[0]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback roadmap for offline presentation
        const mockRoadmap: LearningPath = {
          id: 1,
          subject: "Physics & Electrical Circuits",
          title: "Mastery Tree: From Charge to Complex Networks",
          overall_progress: 65.0,
          nodes: [
            {
              id: "node-1",
              title: "Electric Charge & Electrostatics",
              subject: "Physics",
              description: "Coulomb's law, electric fields, and potential difference (Voltage) fundamentals.",
              prerequisites: [],
              difficulty: "Beginner",
              estimated_minutes: 15,
              mastery_level: 95.0,
              is_unlocked: true,
              is_completed: true,
            },
            {
              id: "node-2",
              title: "Ohm's Law & Circuit Dynamics",
              subject: "Physics",
              description: "The fundamental triad: Voltage (V), Current (I), and Resistance (R).",
              prerequisites: ["node-1"],
              difficulty: "Beginner",
              estimated_minutes: 20,
              mastery_level: 85.0,
              is_unlocked: true,
              is_completed: true,
            },
            {
              id: "node-3",
              title: "Series & Parallel Resistor Networks",
              subject: "Physics",
              description: "Equivalent resistance, voltage dividers, and current branching laws.",
              prerequisites: ["node-2"],
              difficulty: "Intermediate",
              estimated_minutes: 25,
              mastery_level: 55.0,
              is_unlocked: true,
              is_completed: false,
            },
            {
              id: "node-4",
              title: "Kirchhoff's Laws (KCL & KVL)",
              subject: "Physics",
              description: "Conservation of charge and energy applied to complex multi-loop circuit topologies.",
              prerequisites: ["node-3"],
              difficulty: "Advanced",
              estimated_minutes: 30,
              mastery_level: 20.0,
              is_unlocked: false,
              is_completed: false,
            },
            {
              id: "node-5",
              title: "Capacitance & RC Transient Dynamics",
              subject: "Physics",
              description: "Dielectrics, charge storage, time constants (tau = RC), and exponential charging curves.",
              prerequisites: ["node-4"],
              difficulty: "Advanced",
              estimated_minutes: 35,
              mastery_level: 0.0,
              is_unlocked: false,
              is_completed: false,
            },
          ],
          edges: [
            { from: "node-1", to: "node-2" },
            { from: "node-2", to: "node-3" },
            { from: "node-3", to: "node-4" },
            { from: "node-4", to: "node-5" },
          ],
        };
        setRoadmap(mockRoadmap);
        setSelectedNode(mockRoadmap.nodes[1]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !roadmap) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading interactive learning roadmap...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Compass size={13} className="text-cyan-400" />
          <span>Curriculum Skill Tree</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
          {roadmap.title}
        </h1>
        <p className="text-xs text-slate-400">
          Visual prerequisite roadmap. Master foundational concepts before unlocking advanced circuit theorems.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Roadmap Tree Nodes (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Roadmap Progress: {Math.round(roadmap.overall_progress)}%
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Mastered
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Active
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-600" /> Locked
              </span>
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {roadmap.nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-400 shadow-lg shadow-brand-500/15'
                      : node.is_completed
                      ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                      : node.is_unlocked
                      ? 'bg-slate-900/80 border-cyan-500/40 hover:border-cyan-400'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* Node Icon on spine */}
                  <div
                    className={`absolute -left-9 top-4 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                      node.is_completed
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : node.is_unlocked
                        ? 'bg-cyan-500 border-cyan-400 text-white animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {node.is_completed ? '✓' : node.is_unlocked ? '●' : <Lock size={10} />}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{node.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {node.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{node.description}</p>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 block">
                        {Math.round(node.mastery_level)}%
                      </span>
                      <span className="text-[10px] text-slate-500">{node.estimated_minutes} mins</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-slate-800 space-y-4 sticky top-24">
          {selectedNode ? (
            <>
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {selectedNode.subject} • {selectedNode.difficulty}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {selectedNode.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Estimated Time</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {selectedNode.estimated_minutes} Minutes
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Current Mastery</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {Math.round(selectedNode.mastery_level)}%
                  </span>
                </div>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/teach')}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Play size={14} className="fill-white" />
                <span>Launch Interactive Lesson</span>
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">Select a roadmap node to view curriculum details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
