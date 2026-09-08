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
  BookOpen,
  Layers,
  Cpu,
} from 'lucide-react';
import { useTeachingStore } from '../store/useTeachingStore';
import { demoApi } from '../services/api';
import { LearningPath, RoadmapNode } from '../types';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLesson } = useTeachingStore();

  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  const mockRoadmap: LearningPath = {
    id: 1,
    subject: 'ECE & Circuit Engineering',
    title: 'Mastery Tree: From Fundamentals to High-Speed FPGA Systems',
    overall_progress: 72.0,
    nodes: [
      {
        id: 'node-1',
        title: 'Circuit Fundamentals & Ohm\'s Law',
        subject: 'Analog & Digital',
        description: 'Master Voltage, Current, and Resistance (V=IR) using intuitive physical models.',
        prerequisites: [],
        difficulty: 'Basic',
        estimated_minutes: 15,
        mastery_level: 98.0,
        is_unlocked: true,
        is_completed: true,
      },
      {
        id: 'node-2',
        title: 'PCB 4-Layer Stackup & Decoupling',
        subject: 'PCB Design',
        description: 'Learn return current loops, ground plane placement, and IC decoupling capacitor rules.',
        prerequisites: ['node-1'],
        difficulty: 'Advance',
        estimated_minutes: 25,
        mastery_level: 88.0,
        is_unlocked: true,
        is_completed: true,
      },
      {
        id: 'node-3',
        title: 'MATLAB Matrix Math & Signal FFT',
        subject: 'MATLAB',
        description: 'Vectorized computing, time-to-frequency conversions, and digital filter design.',
        prerequisites: ['node-2'],
        difficulty: 'Advance',
        estimated_minutes: 25,
        mastery_level: 65.0,
        is_unlocked: true,
        is_completed: false,
      },
      {
        id: 'node-4',
        title: 'Op-Amps & MOSFET Small-Signal Biasing',
        subject: 'Analog & Digital',
        description: 'Inverting/Non-inverting gains, transconductance, and active RC filtering.',
        prerequisites: ['node-3'],
        difficulty: 'Advance',
        estimated_minutes: 30,
        mastery_level: 40.0,
        is_unlocked: true,
        is_completed: false,
      },
      {
        id: 'node-5',
        title: 'DCD: Mealy & Moore FSM State Synthesis',
        subject: 'DCD',
        description: 'K-Map minimization, next-state logic, and Verilog non-blocking assignments.',
        prerequisites: ['node-4'],
        difficulty: 'High Level',
        estimated_minutes: 30,
        mastery_level: 15.0,
        is_unlocked: true,
        is_completed: false,
      },
      {
        id: 'node-6',
        title: 'High-Speed Differential Pairs & FPGA STA',
        subject: 'Mastery',
        description: 'Impedance matching (90Ω USB/100Ω PCIe), Static Timing Analysis, and clock domain crossing.',
        prerequisites: ['node-5'],
        difficulty: 'High Level',
        estimated_minutes: 35,
        mastery_level: 0.0,
        is_unlocked: false,
        is_completed: false,
      },
    ],
    edges: [
      { from: 'node-1', to: 'node-2' },
      { from: 'node-2', to: 'node-3' },
      { from: 'node-3', to: 'node-4' },
      { from: 'node-4', to: 'node-5' },
      { from: 'node-5', to: 'node-6' },
    ],
  };

  useEffect(() => {
    setSelectedNode(mockRoadmap.nodes[1]);
  }, []);

  const handleLaunchNode = async (node: RoadmapNode) => {
    try {
      const lesson = await demoApi.startCourse('pcb-design');
      setLesson(lesson);
      navigate('/teach');
    } catch {
      navigate('/teach');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="rounded-3xl p-6 bg-white border border-purple-100 shadow-purple-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
            <Compass size={14} className="text-purple-600" />
            <span>Interactive Engineering Knowledge Tree</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-950">
            {mockRoadmap.title}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Progressive dependency tree covering PCB Design, MATLAB, Analog/Digital Circuits, and DCD across all 3 stages.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-display font-black text-purple-700">
            {mockRoadmap.overall_progress}%
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Tree Mastery</p>
        </div>
      </div>

      {/* Nodes Map & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Nodes Timeline (7 cols) */}
        <div className="lg:col-span-7 purple-white-card p-6 bg-white border-purple-200 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-purple-100">
            Sequential Learning Trajectory
          </h3>

          <div className="space-y-3 relative">
            {mockRoadmap.nodes.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-100 border-purple-600 shadow-purple-sm'
                      : node.is_completed
                      ? 'bg-purple-50/50 border-purple-200 hover:bg-purple-50'
                      : node.is_unlocked
                      ? 'bg-white border-slate-200 hover:border-purple-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        node.is_completed
                          ? 'bg-emerald-100 text-emerald-700'
                          : node.is_unlocked
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {node.is_completed ? (
                        <CheckCircle2 size={18} />
                      ) : node.is_unlocked ? (
                        <span>{idx + 1}</span>
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-950">
                        {node.title}
                      </h4>
                      <p className="text-[11px] font-semibold text-purple-700">
                        {node.subject} • {node.difficulty} Stage
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {node.mastery_level}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details (5 cols) */}
        <div className="lg:col-span-5">
          {selectedNode && (
            <div className="purple-white-card p-6 bg-white border-purple-200 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                  {selectedNode.difficulty} Stage
                </span>
                <h3 className="text-lg font-bold text-slate-950 mt-2">
                  {selectedNode.title}
                </h3>
                <p className="text-xs font-semibold text-purple-700">{selectedNode.subject}</p>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedNode.description}
              </p>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1 text-xs text-slate-800">
                <p className="font-bold text-purple-900">Stage Target Objective:</p>
                <p>Master practical application and pass diagnostic checkpoint with 80%+ score.</p>
              </div>

              <button
                onClick={() => handleLaunchNode(selectedNode)}
                className="w-full purple-gradient-btn py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-purple-md"
              >
                <Play size={14} fill="currentColor" />
                <span>Start Interactive Lesson</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
