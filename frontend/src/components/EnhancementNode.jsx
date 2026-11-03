import React, { useState } from 'react';
import { Sparkles, Sliders, X, Eye } from 'lucide-react';
import NecklaceConnector from './NecklaceConnector';

export default function EnhancementNode({ 
  result, 
  previewUrl, 
  isExpanded, 
  onToggleExpand 
}) {
  const [activeTab, setActiveTab] = useState('enhanced'); // 'enhanced', 'compare', 'raw'

  const rawImage = result?.original || previewUrl;
  const enhancedImage = result?.enhanced || result?.preprocessed || rawImage;

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 select-none">
      {/* Hand-Drawn Dotted Necklace Connectors (Left from Upload, Right to Segmentation) */}
      <NecklaceConnector direction="left" />
      <NecklaceConnector direction="right" />

      {/* =========================================================================
          STATE 1: THE GLOWING CURVED RECTANGULAR BOX ("Enhancement")
          Shown when not expanded
         ========================================================================= */}
      {!isExpanded && (
        <div className="relative group w-full max-w-[380px] sm:max-w-[420px] z-20 animate-in fade-in zoom-in-95 duration-300">
          <div 
            className="absolute -inset-1 rounded-[30px] bg-white/10 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" 
          />

          <div
            onClick={onToggleExpand}
            className="relative w-full h-[220px] sm:h-[240px] rounded-[28px] bg-[#0c0e14]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.9)] hover:scale-[1.01] hover:bg-[#10131c]"
          >
            {/* SVG: EXACTLY 1 LONG THIN WHITE LIGHT TRAVELING AROUND EDGES FOREVER */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect
                x="0.8"
                y="0.8"
                width="98.4"
                height="98.4"
                rx="12"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="0.8"
                y="0.8"
                width="98.4"
                height="98.4"
                rx="12"
                fill="none"
                pathLength="1000"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="5"
                strokeDasharray="240 760"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="animate-single-beam"
                style={{ filter: 'blur(3px)' }}
              />
              <rect
                x="0.8"
                y="0.8"
                width="98.4"
                height="98.4"
                rx="12"
                fill="none"
                pathLength="1000"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeDasharray="240 760"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="animate-single-beam"
                style={{
                  filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 20px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.8))',
                }}
              />
            </svg>

            {/* Central Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mb-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:border-white/30 group-hover:bg-white/[0.1] transition-all">
              <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>

            {/* "Enhancement" written in centre */}
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              Enhancement
            </span>

            <span className="text-[10px] font-mono text-slate-400 mt-2">
              (Click to view enhanced image)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: THE PICTURE EMERGES FROM THE BOX
          Shown when clicked, smoothly folds back on click
         ========================================================================= */}
      {isExpanded && (
        <div className="relative z-30 max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-400">
          <div className="relative rounded-3xl bg-[#0c0e14]/95 border border-white/[0.1] p-4 sm:p-6 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] w-full flex flex-col items-center">
            {/* Minimal Header with Tab Controls and Close Button */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
                <button
                  onClick={() => setActiveTab('enhanced')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'enhanced'
                      ? 'bg-white/[0.12] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Enhanced by Model
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-white/[0.12] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'raw'
                      ? 'bg-white/[0.12] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Input
                </button>
              </div>

              {/* Fold back into box button */}
              <button
                onClick={onToggleExpand}
                title="Fold picture back into box"
                className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-mono border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fold back</span>
              </button>
            </div>

            {/* The Emerged Image Display */}
            {activeTab === 'enhanced' && (
              <div className="flex flex-col items-center">
                <img
                  src={enhancedImage}
                  alt="Enhanced by Model"
                  className="max-h-[460px] w-auto object-contain rounded-2xl shadow-2xl border border-white/[0.08]"
                />
                <span className="text-[11px] font-mono text-emerald-400 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Optically Enhanced (CLAHE Contrast Stretched & Color-Balanced)
                </span>
              </div>
            )}

            {activeTab === 'raw' && (
              <div className="flex flex-col items-center">
                <img
                  src={rawImage}
                  alt="Raw Underwater Input"
                  className="max-h-[460px] w-auto object-contain rounded-2xl shadow-2xl border border-white/[0.08]"
                />
                <span className="text-[11px] font-mono text-slate-400 mt-3">
                  Raw Underwater Image (Original Unprocessed)
                </span>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center p-2 rounded-xl bg-black/40 border border-white/[0.05]">
                  <img
                    src={rawImage}
                    alt="Raw"
                    className="max-h-[260px] w-auto object-contain rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-2">1. Raw Input</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-black/40 border border-sky-400/30">
                  <img
                    src={enhancedImage}
                    alt="Enhanced"
                    className="max-h-[260px] w-auto object-contain rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-sky-400 mt-2">2. Enhanced Output</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
