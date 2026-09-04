import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import {
  Zap, Droplets, BookOpen, Layers, Sliders, Sparkles,
  Cpu, Activity, FlaskConical, Dna, TrendingUp, Atom
} from 'lucide-react';
import { LessonSection } from '../../types';

interface BlackboardProps {
  section?: LessonSection;
  isDemonstrating?: boolean;
  subject?: string;
}

// ─── KaTeX renderer ──────────────────────────────────────────────────────────
function renderFormula(tex: string) {
  try {
    return { __html: katex.renderToString(tex, { displayMode: true, throwOnError: false }) };
  } catch {
    return { __html: tex };
  }
}

// ─── 1. Physics: DC Circuit Simulator ────────────────────────────────────────
const CircuitSimulator: React.FC = () => {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const current = parseFloat((voltage / resistance).toFixed(2));
  const power = parseFloat((voltage * current).toFixed(1));
  const animDuration = Math.max(0.6, Math.min(4.0, 6 / (current || 1)));

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      <div className="relative w-full h-64 md:h-72 bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 500 240" className="w-full h-full">
          <defs>
            <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={Math.min(18, Math.max(3, power / 4))} />
            </filter>
          </defs>
          <rect x="60" y="40" width="380" height="160" rx="14" fill="none" stroke="#334155" strokeWidth="6" />
          <rect x="60" y="40" width="380" height="160" rx="14" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="14 18"
            style={{ animation: `bbDash ${animDuration}s linear infinite` }} />
          <style>{`@keyframes bbDash { to { stroke-dashoffset: -32; } }`}</style>
          {/* Battery */}
          <g transform="translate(60,120)">
            <circle cx="0" cy="0" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="-12" y1="-8" x2="12" y2="-8" stroke="#38bdf8" strokeWidth="3" />
            <line x1="-6" y1="8" x2="6" y2="8" stroke="#f43f5e" strokeWidth="3" />
            <text x="-44" y="-4" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">+</text>
            <text x="-44" y="14" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">-</text>
            <text x="-50" y="34" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">{voltage}V</text>
          </g>
          {/* Resistor */}
          <g transform="translate(250,40)">
            <rect x="-42" y="-14" width="84" height="28" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
            <path d="M -30 0 L -20 -8 L -10 8 L 0 -8 L 10 8 L 20 -8 L 30 0" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="0" y="-20" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">R = {resistance} Ω</text>
          </g>
          {/* Bulb */}
          <g transform="translate(250,200)">
            <circle cx="0" cy="0" r={Math.min(35, Math.max(12, power / 2))} fill="#fbbf24"
              opacity={Math.min(0.9, Math.max(0.15, power / 40))} filter="url(#bulbGlow)" />
            <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
            <path d="M -6 6 L -2 -4 L 2 -4 L 6 6" fill="none" stroke="#fef08a" strokeWidth="2" />
            <text x="0" y="34" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Bulb ({power} W)</text>
          </g>
          {/* Ammeter */}
          <g transform="translate(440,120)">
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
            <text x="0" y="4" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">A</text>
            <text x="36" y="5" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">{current} A</text>
          </g>
        </svg>
        <div className="absolute top-3 right-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-cyan-300">
          I = {voltage}/{resistance} = <span className="font-bold text-white">{current} A</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Voltage (V)</span>
            <span className="font-mono font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">{voltage} V</span>
          </div>
          <input type="range" min="1" max="24" step="1" value={voltage} onChange={e => setVoltage(+e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
          <div className="flex justify-between text-[10px] text-slate-500"><span>1V</span><span>24V</span></div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Resistance (Ω)</span>
            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{resistance} Ω</span>
          </div>
          <input type="range" min="1" max="20" step="1" value={resistance} onChange={e => setResistance(+e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          <div className="flex justify-between text-[10px] text-slate-500"><span>1Ω</span><span>20Ω</span></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['Current (I)', `${current} A`, 'text-cyan-400'], ['Power (P)', `${power} W`, 'text-amber-400'], ['Status', resistance > 10 ? 'Constricted' : 'Free Flow', 'text-emerald-400']].map(([label, val, cls]) => (
          <div key={label} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">{label}</span>
            <span className={`text-lg font-bold font-mono ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 2. Computer Science: Neural Network Simulator ────────────────────────────
const NeuralNetSimulator: React.FC = () => {
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(-1.0);
  const [bias, setBias] = useState(1.0);
  const [x1, setX1] = useState(2.0);
  const [x2, setX2] = useState(3.0);
  const [activeFunc, setActiveFunc] = useState<'relu' | 'sigmoid'>('relu');

  const z = parseFloat((w1 * x1 + w2 * x2 + bias).toFixed(3));
  const relu = (v: number) => Math.max(0, v);
  const sigmoid = (v: number) => parseFloat((1 / (1 + Math.exp(-v))).toFixed(4));
  const output = activeFunc === 'relu' ? relu(z) : sigmoid(z);

  const nodeColor = (active: boolean) => active ? '#8b5cf6' : '#334155';

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-52 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        <svg viewBox="0 0 500 200" className="w-full h-full">
          {/* Connections */}
          <line x1="100" y1="65" x2="250" y2="100" stroke={w1 > 0 ? '#8b5cf6' : '#f43f5e'} strokeWidth={Math.abs(w1) * 3 + 1} opacity="0.7" />
          <line x1="100" y1="135" x2="250" y2="100" stroke={w2 > 0 ? '#8b5cf6' : '#f43f5e'} strokeWidth={Math.abs(w2) * 3 + 1} opacity="0.7" />
          <line x1="250" y1="100" x2="400" y2="100" stroke="#10b981" strokeWidth="3" opacity="0.8" />

          {/* Input nodes */}
          <circle cx="100" cy="65" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="100" y="70" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">x₁={x1}</text>
          <circle cx="100" cy="135" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="100" y="140" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">x₂={x2}</text>

          {/* Weight labels */}
          <text x="165" y="75" fill={w1 >= 0 ? '#a78bfa' : '#f87171'} fontSize="10" fontWeight="bold">w₁={w1}</text>
          <text x="165" y="130" fill={w2 >= 0 ? '#a78bfa' : '#f87171'} fontSize="10" fontWeight="bold">w₂={w2}</text>

          {/* Hidden neuron */}
          <circle cx="250" cy="100" r="30" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2.5" />
          <text x="250" y="96" textAnchor="middle" fill="#c4b5fd" fontSize="9">z={z}</text>
          <text x="250" y="110" textAnchor="middle" fill="#a78bfa" fontSize="8">Σ+b</text>

          {/* Output node */}
          <circle cx="400" cy="100" r="28" fill="#052e16" stroke="#10b981" strokeWidth="2.5" />
          <text x="400" y="96" textAnchor="middle" fill="#6ee7b7" fontSize="9">{activeFunc.toUpperCase()}</text>
          <text x="400" y="112" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">{output}</text>

          {/* Bias label */}
          <text x="250" y="148" textAnchor="middle" fill="#fb923c" fontSize="9">bias={bias}</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {[
          { label: 'x₁ Input', val: x1, set: setX1, min: -3, max: 3, step: 0.5, color: 'brand' },
          { label: 'x₂ Input', val: x2, set: setX2, min: -3, max: 3, step: 0.5, color: 'brand' },
          { label: 'Weight w₁', val: w1, set: setW1, min: -2, max: 2, step: 0.1, color: 'purple' },
          { label: 'Weight w₂', val: w2, set: setW2, min: -2, max: 2, step: 0.1, color: 'purple' },
          { label: 'Bias b', val: bias, set: setBias, min: -3, max: 3, step: 0.5, color: 'amber' },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">{label}</span>
              <span className={`font-mono font-bold text-${color}-300`}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(+e.target.value)}
              className={`w-full h-1.5 rounded appearance-none cursor-pointer accent-${color}-500`} />
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-slate-400 block">Activation</span>
          <div className="flex gap-2">
            {(['relu', 'sigmoid'] as const).map(fn => (
              <button key={fn} onClick={() => setActiveFunc(fn)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${activeFunc === fn ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {fn.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs text-slate-300">
        <span className="text-purple-300 font-semibold">Computation: </span>
        z = ({w1} × {x1}) + ({w2} × {x2}) + {bias} = <span className="text-white font-bold">{z}</span>
        {' → '}{activeFunc.toUpperCase()}({z}) = <span className="text-emerald-300 font-bold">{output}</span>
      </div>
    </div>
  );
};

// ─── 3. Mathematics: Calculus Derivative Simulator ───────────────────────────
const CalculusSimulator: React.FC = () => {
  const [xVal, setXVal] = useState(2.0);
  const [deltaX, setDeltaX] = useState(1.0);

  const f = (x: number) => x * x; // f(x) = x²
  const fx = f(xVal);
  const fxh = f(xVal + deltaX);
  const secantSlope = parseFloat(((fxh - fx) / deltaX).toFixed(4));
  const tangentSlope = parseFloat((2 * xVal).toFixed(2)); // f'(x) = 2x

  const W = 500, H = 220;
  const ox = 60, oy = H - 30;
  const scaleX = 55, scaleY = 10;

  const toSvg = (x: number, y: number) => ({ cx: ox + x * scaleX, cy: oy - y * scaleY });
  const curvePoints = Array.from({ length: 60 }, (_, i) => {
    const x = -0.5 + i * 0.12;
    const p = toSvg(x, f(x));
    return `${p.cx},${p.cy}`;
  }).join(' ');

  const p1 = toSvg(xVal, fx);
  const p2 = toSvg(xVal + deltaX, fxh);
  const tangX1 = toSvg(xVal - 1, fx - tangentSlope);
  const tangX2 = toSvg(xVal + 1, fx + tangentSlope);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-56 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {/* Axes */}
          <line x1={ox} y1={20} x2={ox} y2={oy} stroke="#334155" strokeWidth="1.5" />
          <line x1={ox} y1={oy} x2={W - 20} y2={oy} stroke="#334155" strokeWidth="1.5" />
          <text x={W - 18} y={oy + 4} fill="#475569" fontSize="10">x</text>
          <text x={ox - 4} y={18} fill="#475569" fontSize="10">y</text>

          {/* Curve f(x)=x² */}
          <polyline points={curvePoints} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          <text x={ox + 4.5 * scaleX} y={oy - f(4.5) * scaleY - 8} fill="#38bdf8" fontSize="10">f(x)=x²</text>

          {/* Secant line */}
          <line x1={p1.cx} y1={p1.cy} x2={p2.cx} y2={p2.cy} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />

          {/* Tangent line */}
          <line x1={tangX1.cx} y1={tangX1.cy} x2={tangX2.cx} y2={tangX2.cy} stroke="#10b981" strokeWidth="2" />

          {/* Points */}
          <circle cx={p1.cx} cy={p1.cy} r="5" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
          <text x={p1.cx + 6} y={p1.cy - 6} fill="#c4b5fd" fontSize="9">({xVal.toFixed(1)}, {fx.toFixed(1)})</text>

          {deltaX > 0.05 && (
            <>
              <circle cx={p2.cx} cy={p2.cy} r="4" fill="#f59e0b" stroke="white" strokeWidth="1" />
              <text x={p2.cx + 6} y={p2.cy - 6} fill="#fcd34d" fontSize="9">({(xVal + deltaX).toFixed(1)}, {fxh.toFixed(1)})</text>
            </>
          )}

          {/* Legend */}
          <rect x={W - 145} y={8} width="135" height="42" rx="6" fill="#0f172a" stroke="#334155" />
          <line x1={W - 137} y1="22" x2={W - 122} y2="22" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
          <text x={W - 118} y="26" fill="#fcd34d" fontSize="9">Secant slope={secantSlope}</text>
          <line x1={W - 137} y1="38" x2={W - 122} y2="38" stroke="#10b981" strokeWidth="2" />
          <text x={W - 118} y="42" fill="#6ee7b7" fontSize="9">Tangent f'(x)={tangentSlope}</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">x value</span>
            <span className="font-mono font-bold text-purple-300">{xVal.toFixed(1)}</span>
          </div>
          <input type="range" min="-0.5" max="4" step="0.1" value={xVal} onChange={e => setXVal(+e.target.value)}
            className="w-full h-2 rounded appearance-none cursor-pointer accent-purple-500" />
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Δx (drag → 0)</span>
            <span className={`font-mono font-bold ${deltaX < 0.2 ? 'text-emerald-300' : 'text-amber-300'}`}>{deltaX.toFixed(2)}</span>
          </div>
          <input type="range" min="0.01" max="3" step="0.01" value={deltaX} onChange={e => setDeltaX(+e.target.value)}
            className="w-full h-2 rounded appearance-none cursor-pointer accent-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Secant Slope</div>
          <div className="font-bold font-mono text-amber-300">{secantSlope}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Tangent f'(x)</div>
          <div className="font-bold font-mono text-emerald-300">{tangentSlope}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-purple-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Error |Δ|</div>
          <div className={`font-bold font-mono ${Math.abs(secantSlope - tangentSlope) < 0.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.abs(secantSlope - tangentSlope).toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 4. Chemistry: Reaction Kinetics Simulator ───────────────────────────────
const ChemistrySimulator: React.FC = () => {
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [catalyst, setCatalyst] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame(f => f + 1), 120);
    return () => clearInterval(id);
  }, []);

  const baseEa = 80;
  const Ea = catalyst ? baseEa * 0.45 : baseEa;
  const reactantsE = 20;
  const productsE = 40;
  const peakE = reactantsE + Ea;

  const rateProxy = parseFloat((Math.exp(-Ea / (temperature * 0.1)) * 1000).toFixed(2));
  const collisions = Math.min(20, Math.floor(temperature / 30));

  const W = 500, H = 200;
  const toY = (e: number) => H - 20 - e * 1.5;

  // Bezier curve for energy diagram
  const rX = 60, pX = 440;
  const midX = (rX + pX) / 2;
  const pathD = `M ${rX} ${toY(reactantsE)} Q ${midX} ${toY(peakE)} ${pX} ${toY(productsE)}`;
  const catPathD = catalyst ? `M ${rX} ${toY(reactantsE)} Q ${midX} ${toY(reactantsE + baseEa * 0.45)} ${pX} ${toY(productsE)}` : '';

  // Collision dots
  const dots = Array.from({ length: collisions }, (_, i) => {
    const angle = ((frame * 2 + i * (360 / collisions)) % 360) * Math.PI / 180;
    const r = 55 + Math.sin(i * 1.3) * 20;
    return {
      x: W / 2 + Math.cos(angle) * r * 0.5,
      y: toY(40) + Math.sin(angle) * r * 0.3,
      fast: i < Math.floor(collisions * 0.3),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-52 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {/* Axes */}
          <line x1={rX - 10} y1={toY(0)} x2={pX + 10} y2={toY(0)} stroke="#334155" strokeWidth="1" />
          <line x1={rX - 10} y1={toY(0)} x2={rX - 10} y2="10" stroke="#334155" strokeWidth="1" />
          <text x="8" y="12" fill="#475569" fontSize="9">Energy</text>
          <text x={pX - 10} y={toY(0) + 12} fill="#475569" fontSize="9">Rxn coord →</text>

          {/* Main path */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" />
          {catalyst && <path d={catPathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 3" />}

          {/* Energy level labels */}
          <line x1={rX} y1={toY(reactantsE)} x2={rX + 45} y2={toY(reactantsE)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
          <text x={rX + 48} y={toY(reactantsE) + 4} fill="#94a3b8" fontSize="9">Reactants ({reactantsE} kJ)</text>
          <line x1={pX} y1={toY(productsE)} x2={pX - 45} y2={toY(productsE)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
          <text x={pX - 150} y={toY(productsE) + 4} fill="#94a3b8" fontSize="9">Products ({productsE} kJ)</text>

          {/* Ea label at peak */}
          <text x={midX - 15} y={toY(peakE) - 8} fill="#f59e0b" fontSize="10" fontWeight="bold">Eₐ={Ea.toFixed(0)} kJ</text>
          <line x1={midX} y1={toY(reactantsE)} x2={midX} y2={toY(peakE)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Molecular collisions */}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.fast ? 5 : 4}
              fill={d.fast ? '#f59e0b' : '#475569'} opacity={d.fast ? 0.9 : 0.5} />
          ))}

          {catalyst && (
            <text x={midX - 30} y={toY(reactantsE + Ea) - 10} fill="#10b981" fontSize="9">Catalyst path ↓</text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Temperature (K)</span>
            <span className="font-mono font-bold text-amber-300">{temperature} K</span>
          </div>
          <input type="range" min="100" max="800" step="10" value={temperature} onChange={e => setTemperature(+e.target.value)}
            className="w-full h-2 rounded appearance-none cursor-pointer accent-amber-500" />
          <div className="flex justify-between text-[10px] text-slate-500"><span>100K Cold</span><span>800K Hot</span></div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <button onClick={() => setCatalyst(c => !c)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${catalyst ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            <Atom size={13} />
            {catalyst ? '✓ Catalyst Active (Lower Eₐ)' : 'Add Catalyst'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Activation Eₐ</div>
          <div className="font-bold font-mono text-amber-300">{Ea.toFixed(0)} kJ</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-brand-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Collisions/s</div>
          <div className="font-bold font-mono text-brand-300">{collisions}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-center">
          <div className="text-slate-400 text-[10px]">Relative Rate</div>
          <div className={`font-bold font-mono ${rateProxy > 1 ? 'text-emerald-400' : 'text-slate-400'}`}>{rateProxy}×</div>
        </div>
      </div>
    </div>
  );
};

// ─── 5. Biology: DNA Double Helix Simulator ───────────────────────────────────
const BiologySimulator: React.FC = () => {
  const [helixAngle, setHelixAngle] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredPair, setHoveredPair] = useState<number | null>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setHelixAngle(a => (a + 0.4) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isAnimating]);

  const basePairs = [
    { base1: 'A', base2: 'T', color1: '#f43f5e', color2: '#38bdf8', bonds: 2 },
    { base1: 'G', base2: 'C', color1: '#8b5cf6', color2: '#10b981', bonds: 3 },
    { base1: 'T', base2: 'A', color1: '#38bdf8', color2: '#f43f5e', bonds: 2 },
    { base1: 'C', base2: 'G', color1: '#10b981', color2: '#8b5cf6', bonds: 3 },
    { base1: 'A', base2: 'T', color1: '#f43f5e', color2: '#38bdf8', bonds: 2 },
    { base1: 'G', base2: 'C', color1: '#8b5cf6', color2: '#10b981', bonds: 3 },
  ];

  const W = 500, H = 210;
  const cx = W / 2;
  const numPairs = basePairs.length;
  const spacing = H / (numPairs + 1);
  const helixWidth = 80;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-52 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden cursor-pointer"
        onClick={() => setIsAnimating(a => !a)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {/* Backbones */}
          {basePairs.map((_, i) => {
            const y = spacing * (i + 1);
            const phase = (helixAngle + i * 30) * Math.PI / 180;
            const x1 = cx - helixWidth - Math.sin(phase) * 30;
            const x2 = cx + helixWidth + Math.sin(phase) * 30;
            const nextY = spacing * (i + 2);
            const nextPhase = (helixAngle + (i + 1) * 30) * Math.PI / 180;
            const nx1 = cx - helixWidth - Math.sin(nextPhase) * 30;
            const nx2 = cx + helixWidth + Math.sin(nextPhase) * 30;
            return (
              <g key={`backbone-${i}`}>
                {i < numPairs - 1 && <>
                  <line x1={x1} y1={y} x2={nx1} y2={nextY} stroke="#475569" strokeWidth="3" opacity="0.7" />
                  <line x1={x2} y1={y} x2={nx2} y2={nextY} stroke="#475569" strokeWidth="3" opacity="0.7" />
                </>}
              </g>
            );
          })}

          {/* Base pairs */}
          {basePairs.map((bp, i) => {
            const y = spacing * (i + 1);
            const phase = (helixAngle + i * 30) * Math.PI / 180;
            const x1 = cx - helixWidth - Math.sin(phase) * 30;
            const x2 = cx + helixWidth + Math.sin(phase) * 30;
            const isHovered = hoveredPair === i;
            const depth = Math.cos(phase);
            const opacity = 0.5 + Math.abs(depth) * 0.5;

            return (
              <g key={`pair-${i}`} onMouseEnter={() => setHoveredPair(i)} onMouseLeave={() => setHoveredPair(null)}
                style={{ cursor: 'pointer' }}>
                {/* Hydrogen bond dashes */}
                {Array.from({ length: bp.bonds }, (_, b) => {
                  const bx = x1 + ((x2 - x1) / (bp.bonds + 1)) * (b + 1);
                  return <rect key={b} x={bx - 3} y={y - 2} width="6" height="4" rx="1"
                    fill="#94a3b8" opacity={opacity * 0.7} />;
                })}
                {/* Base circles */}
                <circle cx={x1} cy={y} r={isHovered ? 14 : 12} fill={bp.color1} opacity={opacity}
                  stroke={isHovered ? 'white' : 'transparent'} strokeWidth="1.5" />
                <text x={x1} y={y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{bp.base1}</text>
                <circle cx={x2} cy={y} r={isHovered ? 14 : 12} fill={bp.color2} opacity={opacity}
                  stroke={isHovered ? 'white' : 'transparent'} strokeWidth="1.5" />
                <text x={x2} y={y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{bp.base2}</text>
              </g>
            );
          })}

          {/* Direction labels */}
          <text x={cx - helixWidth - 60} y={20} fill="#94a3b8" fontSize="9">5' →</text>
          <text x={cx - helixWidth - 60} y={H - 10} fill="#94a3b8" fontSize="9">3'</text>
          <text x={cx + helixWidth + 30} y={20} fill="#94a3b8" fontSize="9">← 3'</text>
          <text x={cx + helixWidth + 30} y={H - 10} fill="#94a3b8" fontSize="9">5'</text>

          {!isAnimating && (
            <text x={cx} y={H / 2} textAnchor="middle" fill="#64748b" fontSize="11">Click to resume rotation</text>
          )}
        </svg>
        {hoveredPair !== null && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 rounded-lg px-3 py-1.5 text-xs text-center border border-slate-700">
            <span className="font-bold" style={{ color: basePairs[hoveredPair].color1 }}>{basePairs[hoveredPair].base1}</span>
            {' '}pairs with{' '}
            <span className="font-bold" style={{ color: basePairs[hoveredPair].color2 }}>{basePairs[hoveredPair].base2}</span>
            {' '}via <span className="text-amber-300 font-semibold">{basePairs[hoveredPair].bonds} hydrogen bonds</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[['A', 'T', '#f43f5e', '#38bdf8', '2 H-bonds'], ['G', 'C', '#8b5cf6', '#10b981', '3 H-bonds']].map(([b1, b2, c1, c2, bonds]) => (
          <div key={`${b1}-${b2}`} className="col-span-1 sm:col-span-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <span className="font-bold text-sm px-2 py-0.5 rounded" style={{ backgroundColor: `${c1}30`, color: c1 as string }}>{b1}</span>
            <span className="text-slate-500">≡</span>
            <span className="font-bold text-sm px-2 py-0.5 rounded" style={{ backgroundColor: `${c2}30`, color: c2 as string }}>{b2}</span>
            <span className="text-slate-400">{bonds}</span>
          </div>
        ))}
        <div className="col-span-2 sm:col-span-4 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
          Click helix to pause • Hover base pairs for details
        </div>
      </div>
    </div>
  );
};

// ─── Main Blackboard Component ────────────────────────────────────────────────
type Tab = 'simulation' | 'analogy' | 'formulas' | 'notes';

export const Blackboard: React.FC<BlackboardProps> = ({ section, isDemonstrating = false, subject }) => {
  const [activeTab, setActiveTab] = useState<Tab>('simulation');

  // Determine subject from prop or section visual_type
  const effectiveSubject = subject ||
    (section?.visual_type === 'neural_net' ? 'Computer Science' :
      section?.visual_type === 'speedometer' || section?.visual_type === 'katex' && section.concept?.includes('Derivative') ? 'Mathematics' :
        section?.visual_type === 'energy_diagram' ? 'Chemistry' :
          section?.visual_type === 'dna_helix' ? 'Biology' : 'Physics');

  const getSimulatorIcon = () => {
    switch (effectiveSubject) {
      case 'Computer Science': return <Cpu size={14} className="text-purple-400" />;
      case 'Mathematics': return <Activity size={14} className="text-emerald-400" />;
      case 'Chemistry': return <FlaskConical size={14} className="text-amber-400" />;
      case 'Biology': return <Dna size={14} className="text-rose-400" />;
      default: return <Zap size={14} className="text-amber-400" />;
    }
  };

  const getSimulatorLabel = () => {
    switch (effectiveSubject) {
      case 'Computer Science': return 'Neural Net Lab';
      case 'Mathematics': return 'Calculus Lab';
      case 'Chemistry': return 'Reaction Lab';
      case 'Biology': return 'DNA Lab';
      default: return 'Circuit Lab';
    }
  };

  const getAnalogy = () => {
    if (section?.analogy_text) return section.analogy_text;
    switch (effectiveSubject) {
      case 'Computer Science':
        return 'Like a committee of advisors with different levels of influence (weights), each member contributing their opinion proportionally to their authority. The bias represents the chairperson\'s predetermined leaning before hearing any input.';
      case 'Mathematics':
        return 'A police radar gun captures your exact speed at a frozen millisecond — unlike calculating your average speed for a full trip. Derivatives give us that same precision for any mathematical function.';
      case 'Chemistry':
        return 'Imagine rolling a skateboard up a steep hill (the activation barrier). If you don\'t push hard enough, you slide back without reaching the other side. A catalyst carves a tunnel through the mountain.';
      case 'Biology':
        return 'DNA is like a library in a vault: the master blueprint stays safe (DNA in nucleus). A photocopy is made (mRNA) and taken to construction workers (Ribosomes) who build the actual structure (Protein).';
      default:
        return 'Like a water pipe system: Voltage is the pump pressure, Current is the water flow rate, and Resistance is the pipe narrowing. Squeeze the pipe (increase R) and flow (I) drops!';
    }
  };

  const renderSimulator = () => {
    switch (effectiveSubject) {
      case 'Computer Science': return <NeuralNetSimulator />;
      case 'Mathematics': return <CalculusSimulator />;
      case 'Chemistry': return <ChemistrySimulator />;
      case 'Biology': return <BiologySimulator />;
      default: return <CircuitSimulator />;
    }
  };

  const renderFormulas = () => {
    const formulasBySubject: Record<string, { label: string; tex: string; desc: string }[]> = {
      Physics: [
        { label: 'Ohm\'s Law', tex: 'V = I \\times R \\iff I = \\frac{V}{R}', desc: 'Current is directly proportional to voltage and inversely proportional to resistance.' },
        { label: 'Solving for R', tex: 'R = \\frac{V}{I}', desc: 'Resistance equals voltage divided by current.' },
        { label: 'Power Law', tex: 'P = V \\times I = I^2 R = \\frac{V^2}{R}', desc: 'Electrical power dissipated as heat or light.' },
      ],
      'Computer Science': [
        { label: 'Weighted Sum', tex: 'z = \\sum_{i} w_i x_i + b', desc: 'Net input to a neuron via weighted sum of inputs plus bias.' },
        { label: 'ReLU', tex: '\\text{ReLU}(z) = \\max(0, z)', desc: 'Rectified Linear Unit: passes positive signals, zeros negatives.' },
        { label: 'Gradient Descent', tex: 'w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}', desc: 'Weight update step to minimize loss L along gradient.' },
      ],
      Mathematics: [
        { label: 'Limit Definition', tex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", desc: 'Formal definition of the derivative as the limit of secant slope.' },
        { label: 'Power Rule', tex: '\\frac{d}{dx}[x^n] = nx^{n-1}', desc: 'Shortcut rule: bring exponent down, subtract 1 from power.' },
        { label: 'Example', tex: "f(x) = x^2 \\Rightarrow f'(x) = 2x", desc: 'At x=3, the instantaneous slope equals 2×3 = 6.' },
      ],
      Chemistry: [
        { label: 'Arrhenius Equation', tex: 'k = A e^{-E_a / RT}', desc: 'Rate constant k increases exponentially as activation energy Ea decreases.' },
        { label: 'NaCl Formation', tex: '\\text{Na} + \\text{Cl} \\to \\text{Na}^+ + \\text{Cl}^- \\to \\text{NaCl}', desc: 'Ionic electron transfer produces table salt.' },
        { label: 'Catalyst Effect', tex: 'E_a^{\\text{cat}} < E_a^{\\text{uncat}} \\Rightarrow k^{\\text{cat}} \\gg k', desc: 'Lower activation energy means dramatically higher reaction rate.' },
      ],
      Biology: [
        { label: 'Central Dogma', tex: '\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}', desc: 'Information flows from genetic code to functional molecules.' },
        { label: 'Base Pairing', tex: 'A = T \\quad (2 \\text{ H-bonds}), \\quad G \\equiv C \\quad (3 \\text{ H-bonds})', desc: 'Chargaff\'s rules govern complementary base pairing in DNA.' },
        { label: 'Semi-Conservative', tex: '\\text{Parent} \\to \\underbrace{(\\text{Old}+\\text{New}) \\times 2}_{\\text{2 Daughter Duplexes}}', desc: 'Each new DNA molecule retains one original template strand.' },
      ],
    };

    const formulas = formulasBySubject[effectiveSubject] || formulasBySubject['Physics'];
    return (
      <div className="space-y-3">
        {formulas.map((f, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] font-semibold text-brand-400 mb-2">{f.label}</div>
            <div dangerouslySetInnerHTML={renderFormula(f.tex)} className="text-sm text-white" />
            <p className="text-[11px] text-slate-400 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-slate-700/50 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-900/80 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            {getSimulatorIcon()}
            Interactive Demonstration Blackboard
          </span>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {([
            { id: 'simulation', icon: Sliders, label: getSimulatorLabel() },
            { id: 'analogy', icon: Droplets, label: 'Analogy' },
            { id: 'formulas', icon: Layers, label: 'Formulas' },
            { id: 'notes', icon: BookOpen, label: 'Key Points' },
          ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'text-slate-400 hover:text-slate-200'}`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 p-5 overflow-y-auto bg-slate-950/60 flex flex-col justify-between">
        {activeTab === 'simulation' && renderSimulator()}

        {activeTab === 'analogy' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2 text-cyan-300 font-semibold">
                <Sparkles size={18} />
                <span>Real-World Mental Model</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{getAnalogy()}</p>
            </div>
            {section?.example_text && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-300 block mb-1.5">Worked Example:</span>
                <p className="text-xs text-slate-300 leading-relaxed">{section.example_text}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formulas' && renderFormulas()}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={15} className="text-brand-400" />
                {section?.title || 'Section Key Concept'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section?.explanation_text || 'Select a section to view the detailed pedagogical breakdown and concept insights.'}
              </p>
            </div>
            {section?.key_points && section.key_points.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block">Core Takeaways:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {section.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">
          Concept: <span className="text-slate-200">{section?.concept || `${effectiveSubject} Core Principles`}</span>
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Est. Duration: {section?.estimated_minutes || 3} mins
        </span>
      </div>
    </div>
  );
};
