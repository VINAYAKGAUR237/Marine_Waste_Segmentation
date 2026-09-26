import React from 'react';
import { Waves, Cpu, ShieldCheck, AlertCircle, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export default function Navbar({ systemStatus, isDemoMode, onToggleDemo, onSwitchToResearch }) {
  const isHealthy = systemStatus?.status === 'healthy';
  const device = systemStatus?.device?.toUpperCase() || 'CPU';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
          <Waves className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AQUA-VIT <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-mono border border-sky-200 font-semibold">v2.0</span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
            Lightweight Multi-Task Vision Transformer for Marine Debris & Microplastics
          </p>
        </div>
      </div>

      {/* System Telemetry & Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Device Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span>ACCEL:</span>
          <span className="text-slate-900 font-bold">{device}</span>
        </div>

        {/* Backend Health Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
          isHealthy 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {isHealthy ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span className="font-semibold">{isHealthy ? 'API ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Switch to Research Publication */}
        {onSwitchToResearch && (
          <button
            onClick={onSwitchToResearch}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-all cursor-pointer shadow-xs"
            title="Switch to academic research paper presentation"
          >
            <span>Research Paper</span>
            <span className="text-[10px] text-sky-600 font-mono font-bold">↗</span>
          </button>
        )}

        {/* Demo Mode Toggle */}
        <button
          onClick={onToggleDemo}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isDemoMode
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
          title="Toggle between actual trained model inference and offline demo output"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>{isDemoMode ? 'DEMO MODE' : 'LIVE MODEL'}</span>
          {isDemoMode ? <ToggleRight className="w-4 h-4 text-amber-600" /> : <ToggleLeft className="w-4 h-4 text-sky-600" />}
        </button>
      </div>
    </header>
  );
}
