import React, { useState } from 'react';
import { Microscope, ToggleLeft, ToggleRight, Sparkles, PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MicroplasticAnalysis() {
  const [mode, setMode] = useState('A'); // 'A' = Classification, 'B' = Particle Segmentation

  const microplasticClasses = [
    { name: 'Fibre', color: '#FF5252', desc: 'Synthetic textile threads from clothing, fishing gear, and ropes.', size: '10 - 200 µm' },
    { name: 'Fragment', color: '#448AFF', desc: 'Irregular sharp shards from breakdown of macro-plastics.', size: '50 - 500 µm' },
    { name: 'Film', color: '#FFAB00', desc: 'Extremely thin plastic sheet remnants from bags and food wrappings.', size: '20 - 300 µm' },
    { name: 'Foam', color: '#00E676', desc: 'Expanded polystyrene (EPS) clusters with porous cellular walls.', size: '100 - 1000 µm' },
    { name: 'Sphere', color: '#E040FB', desc: 'Manufactured microbeads from cosmetics, cleansers, or industrial blasts.', size: '5 - 150 µm' },
  ];

  const demoParticleDistribution = [
    { size: '<50µm', count: 18, color: '#00E5FF' },
    { size: '50-200µm', count: 42, color: '#448AFF' },
    { size: '200-500µm', count: 25, color: '#FFAB00' },
    { size: '>500µm', count: 7, color: '#FF5252' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-purple-500/20 bg-gradient-to-r from-ocean-900 via-ocean-850 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-2">
              <Microscope className="w-4 h-4" />
              <span>TASK HEAD 2: MICROSCOPIC SCALE ANALYSIS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Microplastic Classification & Particle Morphology
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Analyzes micro-particulate marine pollution under optical and fluorescence microscopy. Supports dual operational modes for high-throughput edge classification and morphological particle sizing.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-ocean-950 border border-purple-500/30">
            <button
              onClick={() => setMode('A')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'A'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_-2px_rgba(147,51,234,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MODE A: Classification
            </button>
            <button
              onClick={() => setMode('B')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'B'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_-2px_rgba(147,51,234,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MODE B: Segmentation
            </button>
          </div>
        </div>
      </div>

      {/* Mode Operational Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`glass-panel rounded-2xl p-6 border transition-all ${
          mode === 'A' ? 'border-purple-500/50 shadow-[0_0_25px_-5px_rgba(168,85,247,0.2)]' : 'border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              MODE A: Fast Particle Classification
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-ocean-800 text-purple-300 border border-purple-500/20">
              Low Latency (&lt;15ms)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Leverages Global Average Pooling on the shared Vision Transformer feature map followed by a 2-layer MLP classifier with dropout. Outputs softmax probability distribution across the 5 standard microplastic types.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Target Resolution:</span>
              <span className="text-white">256 x 256</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Output Dimensions:</span>
              <span className="text-cyan-300">Tensor (B, 5)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Edge Feasibility:</span>
              <span className="text-emerald-400">High (1.8M params)</span>
            </div>
          </div>
        </div>

        <div className={`glass-panel rounded-2xl p-6 border transition-all ${
          mode === 'B' ? 'border-purple-500/50 shadow-[0_0_25px_-5px_rgba(168,85,247,0.2)]' : 'border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              MODE B: Morphological Particle Sizing
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-ocean-800 text-cyan-300 border border-cyan-500/20">
              Automated Counting
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Employs a lightweight segmentation decoder with connected component labeling. Quantifies particle counts, pixel area percentage, and generates physical particle size distribution histograms for environmental reporting.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Morphology Analysis:</span>
              <span className="text-white">Connected Components (8-way)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Distribution Buckets:</span>
              <span className="text-cyan-300">&lt;50µm, 50-200µm, 200-500µm, &gt;500µm</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-ocean-850 border border-slate-800">
              <span className="text-slate-400">Quantification Metric:</span>
              <span className="text-emerald-400">Area % & Particle Count</span>
            </div>
          </div>
        </div>
      </div>

      {/* Particle Taxonomy Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
          5 Microplastic Morphological Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {microplasticClasses.map((item) => (
            <div key={item.name} className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-sm text-white">{item.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{item.desc}</p>
              <div className="p-1.5 rounded bg-ocean-850 text-[10px] font-mono text-cyan-300 border border-slate-700">
                Scale: {item.size}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Particle Size Distribution Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Representative Particle Sizing Distribution</h3>
            <p className="text-xs text-slate-400">Microscopy particle count sorted by equivalent diameter</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Sample Telemetry</span>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoParticleDistribution}>
              <XAxis dataKey="size" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#070F2B', borderColor: '#8B5CF6', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
