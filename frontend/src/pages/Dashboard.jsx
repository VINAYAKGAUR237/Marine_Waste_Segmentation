import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  ScanSearch, Trash2, Microscope, Gauge, Cpu, HardDrive, ArrowRight, ShieldCheck 
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard({ modelInfo, onNavigate }) {
  const paramsCount = modelInfo?.statistics?.parameters 
    ? `${(modelInfo.statistics.parameters / 1e6).toFixed(2)}M` 
    : '1.81M';
  const modelSize = modelInfo?.statistics?.model_size_mb 
    ? `${modelInfo.statistics.model_size_mb} MB` 
    : '6.93 MB';

  // Demo telemetry data
  const debrisDistribution = [
    { name: 'Bottles', count: 42, color: '#00E5FF' },
    { name: 'Plastic Bags', count: 35, color: '#FF4081' },
    { name: 'Fishing Nets', count: 28, color: '#FF5722' },
    { name: 'Wrappers', count: 19, color: '#FFEA00' },
    { name: 'Ropes', count: 14, color: '#69F0AE' },
    { name: 'Other', count: 12, color: '#B388FF' },
  ];

  const microplasticDistribution = [
    { name: 'Fibre', value: 45, color: '#FF5252' },
    { name: 'Fragment', value: 28, color: '#448AFF' },
    { name: 'Film', value: 14, color: '#FFAB00' },
    { name: 'Foam', value: 8, color: '#00E676' },
    { name: 'Sphere', value: 5, color: '#E040FB' },
  ];

  const latencyHistory = [
    { time: '10:00', latency: 215 },
    { time: '10:05', latency: 198 },
    { time: '10:10', latency: 204 },
    { time: '10:15', latency: 192 },
    { time: '10:20', latency: 210 },
    { time: '10:25', latency: 201 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-glow p-6 md:p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-800 border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Edge-Ready Dual-Scale Marine Pollution AI
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Shared Vision Transformer for Autonomous Ocean Clean-Up
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Detect large visible plastic waste and microscopic synthetic particles with a unified, lightweight 1.8M parameter CNN-Transformer model engineered for AUVs and edge deployment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('analysis')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-ocean-950 font-bold text-sm shadow-glow-cyan hover:scale-[1.02] transition-all"
            >
              <ScanSearch className="w-4 h-4" />
              Analyze Image
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('preprocessing')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl glass-card text-cyan-300 hover:text-white font-medium text-sm border border-cyan-500/30 hover:border-cyan-500 transition-all"
            >
              Enhance Underwater Image
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Images Analyzed"
          value="128"
          unit="total"
          subtitle="Telemetry sessions"
          icon={ScanSearch}
          color="cyan"
        />
        <StatCard
          title="Debris Found"
          value="150"
          unit="items"
          subtitle="Macro pollutants"
          icon={Trash2}
          color="coral"
        />
        <StatCard
          title="Microplastics"
          value="892"
          unit="particles"
          subtitle="Microscopy items"
          icon={Microscope}
          color="purple"
        />
        <StatCard
          title="Avg Latency"
          value="204"
          unit="ms"
          subtitle="MPS accelerated"
          icon={Gauge}
          color="amber"
        />
        <StatCard
          title="Model Params"
          value={paramsCount}
          unit=""
          subtitle="Shared CNN+ViT"
          icon={Cpu}
          color="emerald"
        />
        <StatCard
          title="Model Size"
          value={modelSize}
          unit=""
          subtitle="FP32 (1.8MB INT8)"
          icon={HardDrive}
          color="cyan"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debris Categories Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Large Marine Debris Distribution</h3>
              <p className="text-xs text-slate-400">Class frequencies identified by compact U-Net segmentation head</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-cyan-300 border border-cyan-500/20">
              Macro Scale
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={debrisDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070F2B', borderColor: '#00E5FF', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#00E5FF' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {debrisDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Microplastic Types Pie Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Microplastic Particle Types</h3>
              <p className="text-xs text-slate-400">Classification head distribution</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-purple-300 border border-purple-500/20">
              Micro Scale
            </span>
          </div>

          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={microplasticDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {microplasticDistribution.map((entry, index) => (
                    <Cell key={`micro-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#070F2B', borderColor: '#8B5CF6', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {microplasticDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
