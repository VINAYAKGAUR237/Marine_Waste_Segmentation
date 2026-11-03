import React from 'react';
import { 
  Sparkles, Layers, History, Shield, 
  User, LogOut, ArrowRight, Upload, Compass, BarChart2 
} from 'lucide-react';

export default function LinearNavbar({
  activeTab,
  onSelectTab,
  systemStatus,
  currentUser,
  onLoginClick,
  onLogoutClick,
  hasActiveResult,
  onNewUpload,
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090a]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo (Linear Style) */}
        <div 
          onClick={() => {
            onSelectTab('analysis');
            if (onNewUpload) onNewUpload();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Linear geometric curved logo mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-white/[0.15] via-white/[0.05] to-transparent border border-white/[0.15] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:border-white/30 transition-all">
            <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                Marine Debris
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                LINEAR
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Linear Style) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs font-medium">
          <button
            onClick={() => onSelectTab('analysis')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Upload & Detection</span>
          </button>

          <button
            onClick={() => onSelectTab('performance')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'performance'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Accuracy Benchmarks</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>My History</span>
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Documentation</span>
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ViT-Lite MPS (77.4% Acc)</span>
          </div>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/VINAYAKGAUR237/Marine_Waste_Segmentation.git"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* User Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300 hidden sm:inline truncate max-w-[120px]">
                {currentUser.name || currentUser.email}
              </span>
              <button
                onClick={onLogoutClick}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/10 hover:border-red-500/30 border border-white/[0.08] text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
