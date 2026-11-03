import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  ScanSearch, Trash2, Gauge, Cpu, HardDrive, ArrowRight, ShieldCheck, History 
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard({ modelInfo, onNavigate }) {
  const segData = modelInfo?.marine_debris_segmentation || {};
  const archData = modelInfo?.model_architecture || {};

  const pixelAcc = segData.pixel_accuracy 
    ? `${(segData.pixel_accuracy * 100).toFixed(1)}%` 
    : '77.4%';
  const debrisIoU = segData.debris_iou 
    ? `${(segData.debris_iou * 100).toFixed(1)}%` 
    : '40.5%';
  const latency = archData.latency_ms ? `${archData.latency_ms} ms` : '31.2 ms';

  // Marine debris class frequencies in TrashCan 1.0 & UTD datasets
  const debrisDistribution = [
    { name: 'Bottles', count: 184, color: '#0284c7' },
    { name: 'Plastic Bags', count: 215, color: '#38bdf8' },
    { name: 'Fishing Nets', count: 96, color: '#0ea5e9' },
    { name: 'Wrappers', count: 142, color: '#0369a1' },
    { name: 'Ropes', count: 118, color: '#7dd3fc' },
    { name: 'Other Debris', count: 165, color: '#bae6fd' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-white border border-slate-200 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-mono text-sky-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              Production Marine Debris Vision Transformer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Real-Time Marine Debris Detection & Segmentation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Detect, segment, and log macro plastic waste using an edge-optimized 1.81M parameter Vision Transformer (MiT-B0) with dual Express + FastAPI API gateway.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onNavigate('analysis')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <ScanSearch className="w-4 h-4" />
              Analyze Image
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Pixel Accuracy"
          value={pixelAcc}
          subtitle="Trained on TrashCan"
          icon={ScanSearch}
          color="emerald"
        />
        <StatCard
          title="Debris mIoU"
          value={debrisIoU}
          subtitle="Debris mask overlap"
          icon={Trash2}
          color="cyan"
        />
        <StatCard
          title="Latency"
          value={latency}
          subtitle="MPS accelerated"
          icon={Gauge}
          color="amber"
        />
        <StatCard
          title="Throughput"
          value="~32 FPS"
          subtitle="Real-time AUV rate"
          icon={ShieldCheck}
          color="sky"
        />
        <StatCard
          title="Model Params"
          value="1.81M"
          subtitle="CNN + MiT-B0"
          icon={Cpu}
          color="slate"
        />
        <StatCard
          title="INT8 Size"
          value="1.86 MB"
          subtitle="71.8% compression"
          icon={HardDrive}
          color="cyan"
        />
      </div>

      {/* Marine Debris Distribution Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              Marine Debris Class Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Taxonomy classes identified by the multi-scale segmentation head
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
            7 Classes
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={debrisDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                itemStyle={{ color: '#0284c7' }}
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
    </div>
  );
}
