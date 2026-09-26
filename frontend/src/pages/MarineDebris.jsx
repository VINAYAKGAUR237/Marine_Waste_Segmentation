import React from 'react';
import { Trash2, CheckCircle2, Info, Layers, Eye } from 'lucide-react';

export default function MarineDebris() {
  const debrisClasses = [
    { id: 1, name: 'Bottle', color: '#00E5FF', desc: 'Rigid PET and HDPE beverage containers and chemical jugs.' },
    { id: 2, name: 'Plastic Bag', color: '#FF4081', desc: 'Single-use polyethylene thin films and supermarket carrier bags.' },
    { id: 3, name: 'Wrapper', color: '#FFEA00', desc: 'Multilayer food packaging, foil crisp bags, and snack wrappers.' },
    { id: 4, name: 'Fishing Net', color: '#FF5722', desc: 'Discarded ghost fishing gear, nylon monofilament and trawl netting.' },
    { id: 5, name: 'Rope', color: '#69F0AE', desc: 'Braided synthetic marine cordage and hawser mooring lines.' },
    { id: 6, name: 'Other Debris', color: '#B388FF', desc: 'Miscellaneous plastic fragments, crates, cups, and utensils.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-500/20 bg-gradient-to-r from-ocean-900 to-ocean-850">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs mb-2">
          <Trash2 className="w-4 h-4" />
          <span>TASK HEAD 1: MACRO-SCALE SEGMENTATION</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Large Visible Marine Debris Segmentation Head
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-2 leading-relaxed">
          The marine debris head employs a lightweight U-Net decoder with depthwise-separable upsampling convolutions. It processes multi-scale hierarchical feature maps ($H/2, H/4, H/8, H/16$) from the shared Vision Transformer encoder to generate precise pixel-wise masks for macro pollutants.
        </p>
      </div>

      {/* Class Taxonomy & Color Palette */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
          Target Pollution Classes & Color Palette
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debrisClasses.map((item) => (
            <div key={item.id} className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: item.color, color: item.color }}
                  />
                  <span className="font-bold text-base text-white">{item.name}</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-ocean-850 text-slate-400 border border-slate-700">
                  ID: {item.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decoder Architecture Specifications */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Compact U-Net Decoder Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-ocean-850 border border-slate-800">
            <span className="text-slate-400 block mb-1">Up-Stage 1 (H/16 → H/8)</span>
            <span className="text-white font-bold block">144 ch + 80 ch → 96 ch</span>
            <span className="text-cyan-400 text-[10px] mt-1 block">Bilinear + DW Conv</span>
          </div>
          <div className="p-3.5 rounded-xl bg-ocean-850 border border-slate-800">
            <span className="text-slate-400 block mb-1">Up-Stage 2 (H/8 → H/4)</span>
            <span className="text-white font-bold block">96 ch + 48 ch → 64 ch</span>
            <span className="text-cyan-400 text-[10px] mt-1 block">Bilinear + DW Conv</span>
          </div>
          <div className="p-3.5 rounded-xl bg-ocean-850 border border-slate-800">
            <span className="text-slate-400 block mb-1">Up-Stage 3 (H/4 → H/2)</span>
            <span className="text-white font-bold block">64 ch + 32 ch → 32 ch</span>
            <span className="text-cyan-400 text-[10px] mt-1 block">Bilinear + DW Conv</span>
          </div>
          <div className="p-3.5 rounded-xl bg-ocean-850 border border-slate-800">
            <span className="text-slate-400 block mb-1">Final Expansion (H/2 → H)</span>
            <span className="text-white font-bold block">32 ch → 16 ch → 7 classes</span>
            <span className="text-emerald-400 text-[10px] mt-1 block">1x1 Pixel Classifier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
