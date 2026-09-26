import React, { useState, useEffect } from 'react';

export default function DepthIndicator({ activeSection, onNavigateSection }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const depthWaypoints = [
    { id: 'hero', depth: '0m', label: 'SURFACE' },
    { id: 'problem', depth: '75m', label: 'OPTICAL PROBLEM' },
    { id: 'question', depth: '150m', label: 'RESEARCH HYPOTHESIS' },
    { id: 'architecture', depth: '300m', label: 'MiT-B0 ARCHITECTURE' },
    { id: 'features', depth: '450m', label: 'FEATURE EXTRACTION' },
    { id: 'lab', depth: '600m', label: 'EXPERIMENT LAB' },
    { id: 'ablation', depth: '750m', label: 'ABLATION STUDY' },
    { id: 'results', depth: '900m', label: 'EMPIRICAL BENCHMARKS' },
    { id: 'datasets', depth: '1050m', label: 'DATASET ARCHIVES' },
    { id: 'paper', depth: '1200m', label: 'BENTHIC / PAPER' },
  ];

  // Approximate current depth in meters based on scroll
  const currentMeters = Math.round((scrollProgress / 100) * 1200);

  return (
    <aside
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end pointer-events-auto select-none"
      aria-label="Ocean Depth Progress"
    >
      {/* Current Depth Digital Readout */}
      <div className="mb-4 px-2.5 py-1.5 rounded-lg bg-white/95 border border-sky-200 font-mono text-[11px] text-sky-800 text-right shadow-sm">
        <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-semibold">Sensor Depth</span>
        <span className="font-bold text-sky-600 text-xs">{currentMeters}m</span>
      </div>

      {/* Vertical Gauge Line */}
      <div className="relative py-2 flex flex-col items-center gap-3">
        <div className="absolute top-0 bottom-0 right-[7px] w-[1px] bg-slate-300" />

        {depthWaypoints.map((wp) => {
          const isActive = activeSection === wp.id;
          return (
            <button
              key={wp.id}
              onClick={() => onNavigateSection(wp.id)}
              className="group flex items-center gap-3 relative py-0.5 cursor-pointer text-right"
              title={`${wp.label} (${wp.depth})`}
            >
              {/* Waypoint Label Hover Bubble */}
              <span className={`text-[10px] font-mono tracking-tight transition-all opacity-0 group-hover:opacity-100 ${
                isActive ? 'opacity-100 text-sky-700 font-bold' : 'text-slate-500'
              }`}>
                {wp.depth} {wp.label}
              </span>

              {/* Waypoint Node Dot */}
              <span
                className={`w-3.5 h-3.5 rounded-full border transition-all z-10 flex items-center justify-center ${
                  isActive
                    ? 'border-sky-500 bg-sky-500 scale-110 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                    : 'border-slate-300 bg-white group-hover:border-sky-400 group-hover:scale-105'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
