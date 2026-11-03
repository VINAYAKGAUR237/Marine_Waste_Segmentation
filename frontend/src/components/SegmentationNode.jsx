import React, { useState } from 'react';
import { Layers, X, Tag } from 'lucide-react';
import NecklaceConnector from './NecklaceConnector';

// Distinct High-Visibility Neon Palette for multiple debris objects
const COLOR_PALETTE = [
  '#00E5FF', // Electric Cyan
  '#FF2E93', // Neon Magenta / Pink
  '#FFD600', // Vivid Yellow
  '#FF5722', // Vivid Orange-Red
  '#00E676', // Mint Green
  '#A855F7', // Electric Violet
  '#38BDF8', // Bright Sky Blue
];

const CLASS_TAXONOMY = {
  // Focused Marine Debris Categories
  trash_plastic_bottle: { label: 'Plastic Bottle', color: '#00E5FF' },
  trash_can: { label: 'Metal Can', color: '#A855F7' },
  trash_bag: { label: 'Plastic Bag', color: '#FF2E93' },
  trash_net: { label: 'Fishing Net', color: '#FF5722' },
  trash_cup: { label: 'Plastic Cup', color: '#FFD600' },
  trash_packet: { label: 'Food Packet', color: '#FFD600' },
  trash_fastfood: { label: 'Food Container', color: '#FF9100' },
  trash_paper: { label: 'Paper Debris', color: '#E2E8F0' },
  trash_shoe: { label: 'Fabric / Shoe Debris', color: '#C084FC' },
  trash_tarp: { label: 'Plastic Tarp', color: '#38BDF8' },
  wreck: { label: 'Submerged Wreckage', color: '#94A3B8' },
  trash_other: { label: 'Marine Debris', color: '#A855F7' },
  bottle: { label: 'Plastic Bottle', color: '#00E5FF' },
  plastic_bag: { label: 'Plastic Bag', color: '#FF2E93' },
  wrapper: { label: 'Food Wrapper', color: '#FFD600' },
  fishing_net: { label: 'Fishing Net', color: '#FF5722' },
  rope: { label: 'Marine Rope', color: '#00E676' },
  other_debris: { label: 'Marine Debris', color: '#A855F7' },

  // Grouped Natural Marine Life
  marine_life: { label: 'Marine Life', color: '#38BDF8' },
  crab: { label: 'Marine Life', color: '#38BDF8' },
  echinus: { label: 'Marine Life', color: '#38BDF8' },
  starfish: { label: 'Marine Life', color: '#38BDF8' },
  coral: { label: 'Marine Life', color: '#38BDF8' },
  fish: { label: 'Marine Life', color: '#38BDF8' },
  plant: { label: 'Marine Life', color: '#38BDF8' },

  // Underwater Equipment
  rov: { label: 'Underwater Equipment', color: '#94A3B8' },
  human_diver: { label: 'Human Diver', color: '#94A3B8' },
  autonomous_underwater_vehicle: { label: 'Underwater Equipment', color: '#94A3B8' },
  instrument: { label: 'Underwater Equipment', color: '#94A3B8' },
  extra_class: { label: 'Marine Object', color: '#94A3B8' },

  // Microplastic Categories
  fibre: { label: 'Microplastic Fibre', color: '#FF5252' },
  fragment: { label: 'Plastic Fragment', color: '#448AFF' },
  film: { label: 'Microplastic Film', color: '#FFAB00' },
  foam: { label: 'Microplastic Foam', color: '#00E676' },
  sphere: { label: 'Microplastic Dot', color: '#E040FB' },
  microplastic: { label: 'Microplastic', color: '#E040FB' },
};

export default function SegmentationNode({ 
  result, 
  previewUrl, 
  isExpanded, 
  onToggleExpand 
}) {
  const [activeView, setActiveView] = useState('boxes'); // 'boxes', 'overlay', 'mask'
  const [hoveredInstanceId, setHoveredInstanceId] = useState(null);

  const rawImage = result?.original || previewUrl;

  // Flatten and extract all debris instances so EACH debris gets its OWN distinct color box and label
  const debrisInstances = [];
  if (Array.isArray(result?.predictions)) {
    let colorCounter = 0;
    result.predictions.forEach((pred, predIdx) => {
      const className = pred.class_name || 'other_debris';
      const meta = CLASS_TAXONOMY[className] || { label: pred.display_name || className.replace('_', ' '), color: COLOR_PALETTE[colorCounter % COLOR_PALETTE.length] };

      const boxes = Array.isArray(pred.bounding_boxes) && pred.bounding_boxes.length > 0
        ? pred.bounding_boxes
        : [{ x: 45, y: 45, width: 85, height: 85 }];

      boxes.forEach((box, boxIdx) => {
        // Assign distinct color: use signature taxonomy color for the class, with palette fallback
        const assignedColor = meta.color || COLOR_PALETTE[colorCounter % COLOR_PALETTE.length];
        colorCounter++;

        const conf = pred.confidence 
          ? (pred.confidence * 100).toFixed(0) 
          : '84';

        debrisInstances.push({
          id: `debris_${predIdx}_${boxIdx}`,
          label: pred.display_name || meta.label,
          color: assignedColor,
          confidence: conf,
          box: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          },
        });
      });
    });
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 select-none">
      {/* Hand-Drawn Dotted Necklace Connector (Coming from Enhancement on the left) */}
      <NecklaceConnector direction="left" />

      {/* =========================================================================
          STATE 1: THE GLOWING CURVED RECTANGULAR BOX ("Segmentation")
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
              <Layers className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>

            {/* "Segmentation" written in centre */}
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              Segmentation
            </span>

            <span className="text-[10px] font-mono text-slate-400 mt-2">
              (Click to view segmented debris)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: THE SEGMENTED IMAGE EMERGES FROM THE BOX
          Shows different marine debrises surrounded by different color boxes with labels
         ========================================================================= */}
      {isExpanded && (
        <div className="relative z-30 max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-400">
          <div className="relative rounded-3xl bg-[#0c0e14]/95 border border-white/[0.1] p-4 sm:p-6 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] w-full flex flex-col items-center">
            {/* Minimal Header with View Controls, Optional Microplastic Tag & Fold Button */}
            <div className="w-full flex items-center justify-between gap-2 mb-4 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.08] text-xs font-mono">
                <button
                  onClick={() => setActiveView('boxes')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeView === 'boxes'
                      ? 'bg-white/[0.12] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bounding Boxes
                </button>
                <button
                  onClick={() => setActiveView('overlay')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeView === 'overlay'
                      ? 'bg-white/[0.12] text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mask Overlay
                </button>
              </div>

              {/* Microplastic Telemetry Pill - Only displayed when microplastic particles are actually detected */}
              {result?.microplastic?.top_class && result.microplastic.top_class !== 'unknown' && result.microplastic.top_class !== 'none_detected' && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
                  <span className="text-sky-400">🔬 Microplastic:</span>
                  <span className="text-white capitalize font-bold">{result.microplastic.top_class}</span>
                  <span className="text-slate-400">({(result.microplastic.confidence * 100).toFixed(0)}%)</span>
                </div>
              )}

              {/* Fold button */}
              <button
                onClick={onToggleExpand}
                title="Fold picture back into box"
                className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-mono border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fold back</span>
              </button>
            </div>

            {/* The Image Canvas with Different Color Boxes Surrounding Each Debris */}
            <div className="relative inline-block max-w-full">
              {activeView === 'boxes' && (
                <>
                  <img
                    src={rawImage}
                    alt="Segmented Marine Debris"
                    className="max-h-[460px] w-auto object-contain rounded-2xl shadow-2xl block border border-white/[0.08]"
                  />

                  {/* Overlaid Color Bounding Boxes: Each Debris Gets Its Own Color Box and Label */}
                  {debrisInstances.map((item) => {
                    const isTarget = hoveredInstanceId === item.id;
                    const isHidden = hoveredInstanceId !== null && !isTarget;

                    const left = `${(item.box.x / 256) * 100}%`;
                    const top = `${(item.box.y / 256) * 100}%`;
                    const width = `${(item.box.width / 256) * 100}%`;
                    const height = `${(item.box.height / 256) * 100}%`;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredInstanceId(item.id)}
                        onMouseLeave={() => setHoveredInstanceId(null)}
                        style={{
                          left,
                          top,
                          width,
                          height,
                          borderColor: item.color,
                          boxShadow: isTarget
                            ? `0 0 28px ${item.color}, inset 0 0 14px ${item.color}70`
                            : `0 0 14px ${item.color}, inset 0 0 8px ${item.color}40`,
                        }}
                        className={`absolute border-2 rounded-md transition-all duration-200 cursor-pointer ${
                          isTarget ? 'z-30 scale-[1.02]' : 'z-20'
                        } ${
                          isHidden
                            ? 'opacity-0 scale-95 pointer-events-none'
                            : 'opacity-100'
                        }`}
                      >
                        {/* Floating Label with Name and Confidence */}
                        <div
                          style={{ backgroundColor: item.color }}
                          className="absolute -top-6 left-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold text-slate-950 flex items-center gap-1.5 shadow-md whitespace-nowrap z-30"
                        >
                          <span>{item.label}</span>
                          <span className="opacity-80">[{item.confidence}%]</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {activeView === 'overlay' && (
                <img
                  src={result?.overlay || rawImage}
                  alt="Segmentation Mask Overlay"
                  className="max-h-[460px] w-auto object-contain rounded-2xl shadow-2xl block border border-white/[0.08]"
                />
              )}
            </div>

            {/* Bottom Color Legend Buttons: Hovering isolates and highlights the corresponding bounding box */}
            {debrisInstances.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.08] w-full">
                {debrisInstances.map((item) => {
                  const isTarget = hoveredInstanceId === item.id;
                  const isDimmed = hoveredInstanceId !== null && !isTarget;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setHoveredInstanceId(item.id)}
                      onMouseLeave={() => setHoveredInstanceId(null)}
                      style={
                        isTarget
                          ? { borderColor: item.color, boxShadow: `0 0 16px ${item.color}60` }
                          : {}
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-200 cursor-pointer select-none ${
                        isTarget
                          ? 'bg-white/[0.16] scale-105 text-white font-bold'
                          : isDimmed
                          ? 'opacity-30 bg-white/[0.02] border-white/[0.04] text-slate-400'
                          : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.1] text-white'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full transition-transform duration-200"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: isTarget ? `0 0 8px ${item.color}` : 'none',
                          transform: isTarget ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-400">({item.confidence}%)</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
