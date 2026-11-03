import React from 'react';
import { Waves, Cpu, ShieldCheck, AlertCircle, Sparkles, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ 
  systemStatus, 
  currentUser, 
  onLoginClick, 
  onLogoutClick, 
  onSwitchToResearch 
}) {
  const isHealthy = systemStatus?.status === 'healthy';
  const fastApiStatus = systemStatus?.fastapi_service || 'online';

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
            Underwater Marine Debris Semantic Segmentation & Telemetry
          </p>
        </div>
      </div>

      {/* System Telemetry & Auth Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Gateway Health Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
          isHealthy 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {isHealthy ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span className="font-semibold">{isHealthy ? 'EXPRESS (5000) ONLINE' : 'GATEWAY OFFLINE'}</span>
        </div>

        {/* Switch to Research Publication */}
        {onSwitchToResearch && (
          <button
            onClick={onSwitchToResearch}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-all cursor-pointer shadow-xs"
            title="Switch to academic research paper presentation"
          >
            <span>Research Paper</span>
            <span className="text-[10px] text-sky-600 font-mono font-bold">↗</span>
          </button>
        )}

        {/* Auth User Info or Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span className="max-w-[120px] truncate">{currentUser.name}</span>
            </div>
            <button
              onClick={onLogoutClick}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
