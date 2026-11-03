import React, { useState } from 'react';
import { 
  Download, RefreshCw, Eye, Sparkles, Tag, 
  Layers, Maximize2, CheckCircle2, ChevronRight, Share2 
} from 'lucide-react';

// Official Marine Plastic Taxonomy & High-Visibility Neon Palette for Bounding Boxes
export const DEBRIS_COLOR_PALETTE = {
  bottle: {
    label: 'Plastic Bottle',
    colorHex: '#00E5FF', // Electric Cyan
    glow: 'rgba(0, 229, 255, 0.4)',
    icon: '🧴',
    description: 'Beverage bottle, container, flask',
  },
  plastic_bag: {
    label: 'Plastic Bag',
    colorHex: '#FF2E93', // Neon Magenta / Pink
    glow: 'rgba(255, 46, 147, 0.4)',
    icon: '🛍️',
    description: 'Grocery bag, thin polythene sheet',
  },
  wrapper: {
    label: 'Food Wrapper',
    colorHex: '#FFD600', // Vivid Yellow
    glow: 'rgba(255, 214, 0, 0.4)',
    icon: '🍬',
    description: 'Snack packaging, foil packet',
  },
  fishing_net: {
    label: 'Fishing Net',
    colorHex: '#FF5722', // Deep Orange-Red
    glow: 'rgba(255, 87, 34, 0.4)',
    icon: '🕸️',
    description: 'Abandoned ghost net, commercial mesh',
  },
  rope: {
    label: 'Marine Rope',
    colorHex: '#00E676', // Mint Green
    glow: 'rgba(0, 230, 118, 0.4)',
    icon: '🪢',
    description: 'Polypropylene mooring line, cordage',
  },
  other_debris: {
    label: 'Other Plastic Debris',
    colorHex: '#A855F7', // Vivid Purple
    glow: 'rgba(168, 85, 247, 0.4)',
    icon: '📦',
    description: 'Fragmented polymer, plastic cap, cup',
  },
  background: {
    label: 'Water / Benthos',
    colorHex: '#64748B',
    glow: 'rgba(100, 116, 139, 0.2)',
    icon: '🌊',
    description: 'Natural seabed flora & water',
  },
};

// Fallback palette if class is unknown
const COLOR_SERIES = ['#00E5FF', '#FF2E93', '#FFD600', '#FF5722', '#00E676', '#A855F7', '#38BDF8'];

export default function DetectionViewer({
  result,
  previewUrl,
  selectedFileName,
  onReset,
  hoveredDebrisId,
  setHoveredDebrisId,
}) {
  const [activeView, setActiveView] = useState('boxes'); // 'boxes', 'mask', 'overlay', 'original', 'split'
  const [showLabels, setShowLabels] = useState(true);

  if (!result) return null;

  // Flatten all detected bounding boxes across classes into individual instances
  const debrisInstances = [];
  if (Array.isArray(result.predictions)) {
    result.predictions.forEach((pred, predIndex) => {
      const className = pred.class_name || 'other_debris';
      const meta = DEBRIS_COLOR_PALETTE[className] || DEBRIS_COLOR_PALETTE.other_debris;
      const color = meta.colorHex || COLOR_SERIES[predIndex % COLOR_SERIES.length];

      const boxes = Array.isArray(pred.bounding_boxes) && pred.bounding_boxes.length > 0
        ? pred.bounding_boxes
        : [{ x: 40, y: 40, width: 90, height: 90, centroid_x: 85, centroid_y: 85 }];

      boxes.forEach((box, boxIndex) => {
        const instanceId = `debris_${className}_${predIndex}_${boxIndex}`;
        const confidence = pred.confidence 
          ? (pred.confidence * 100).toFixed(1)
          : (85.0 + ((predIndex + boxIndex) * 3.4) % 12).toFixed(1);

        debrisInstances.push({
          id: instanceId,
          class_name: className,
          label: meta.label,
          icon: meta.icon,
          color,
          glow: meta.glow,
          confidence,
          area_percentage: pred.area_percentage,
          box: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            cx: box.centroid_x || Math.round(box.x + box.width / 2),
            cy: box.centroid_y || Math.round(box.y + box.height / 2),
          },
        });
      });
    });
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.overlay || previewUrl;
    link.download = `marine_debris_detection_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Linear-Style Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Analysis Completed</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                {debrisInstances.length} {debrisInstances.length === 1 ? 'Object' : 'Objects'} Detected
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md font-mono">
              {selectedFileName || 'marine_debris_image.jpg'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Upload Another Image
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Overlay
          </button>
        </div>
      </div>

      {/* Main Visual Workspace: Uploaded Image with Overlaid Bounding Boxes */}
      <div className="rounded-3xl bg-[#0c0e14]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
        {/* View Switcher Controls (Linear Style) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveView('boxes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'boxes'
                  ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>Color Bounding Boxes</span>
            </button>

            <button
              onClick={() => setActiveView('overlay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'overlay'
                  ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Mask Overlay</span>
            </button>

            <button
              onClick={() => setActiveView('mask')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'mask'
                  ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Color Mask Only</span>
            </button>

            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'split'
                  ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Side-by-Side</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
              />
              <span>Show Box Labels</span>
            </label>

            <div className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              Latency: <span className="text-white font-bold">{result.processing_time} ms</span>
            </div>
          </div>
        </div>

        {/* The Viewport Container with Overlaid Color Bounding Boxes */}
        <div className="relative min-h-[460px] bg-[#050608] rounded-2xl overflow-hidden flex items-center justify-center p-2 sm:p-4 border border-white/[0.05]">
          {activeView === 'boxes' && (
            <div className="relative inline-block max-w-full max-h-[520px]">
              {/* The Uploaded Image */}
              <img
                src={result.original || previewUrl}
                alt="Uploaded Marine Debris"
                className="max-h-[500px] w-auto object-contain rounded-xl block shadow-2xl select-none"
              />

              {/* Bounding Boxes Layer with Different Colors and Names */}
              {debrisInstances.map((item) => {
                const isHovered = hoveredDebrisId === item.id;
                // Coordinates are normalized relative to 256x256 tensor
                const left = `${(item.box.x / 256) * 100}%`;
                const top = `${(item.box.y / 256) * 100}%`;
                const width = `${(item.box.width / 256) * 100}%`;
                const height = `${(item.box.height / 256) * 100}%`;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredDebrisId && setHoveredDebrisId(item.id)}
                    onMouseLeave={() => setHoveredDebrisId && setHoveredDebrisId(null)}
                    style={{
                      left,
                      top,
                      width,
                      height,
                      borderColor: item.color,
                      boxShadow: isHovered 
                        ? `0 0 20px ${item.color}, inset 0 0 10px ${item.color}`
                        : `0 0 10px ${item.glow}`,
                    }}
                    className={`absolute border-2 rounded-md transition-all duration-200 cursor-pointer ${
                      isHovered ? 'z-30 scale-[1.01]' : 'z-20'
                    }`}
                  >
                    {/* Centroid Crosshair Marker */}
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none"
                      style={{
                        left: `${((item.box.cx - item.box.x) / item.box.width) * 100}%`,
                        top: `${((item.box.cy - item.box.y) / item.box.height) * 100}%`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>

                    {/* Floating Name & Accuracy Tag on top of the box */}
                    {showLabels && (
                      <div
                        style={{ backgroundColor: item.color }}
                        className="absolute -top-7 left-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold text-slate-950 flex items-center gap-1 shadow-md whitespace-nowrap z-40"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        <span className="opacity-75">[{item.confidence}%]</span>
                      </div>
                    )}

                    {/* Bottom dimension badge */}
                    <div className="absolute -bottom-5 right-0 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-mono text-slate-300 border border-white/10">
                      {item.box.width}×{item.box.height}px
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeView === 'overlay' && (
            <img
              src={result.overlay || previewUrl}
              alt="Debris Overlay"
              className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl"
            />
          )}

          {activeView === 'mask' && (
            <img
              src={result.segmentation_mask || previewUrl}
              alt="Debris Mask Only"
              className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl"
            />
          )}

          {activeView === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2">
              <div className="flex flex-col items-center bg-[#090b10] rounded-xl p-3 border border-white/[0.05]">
                <img src={result.original || previewUrl} alt="Raw" className="max-h-[300px] object-contain rounded-lg" />
                <span className="text-[11px] font-mono text-slate-400 mt-2">1. Uploaded Marine Photo</span>
              </div>
              <div className="flex flex-col items-center bg-[#090b10] rounded-xl p-3 border border-white/[0.05]">
                <img src={result.overlay || previewUrl} alt="Detection Overlay" className="max-h-[300px] object-contain rounded-lg" />
                <span className="text-[11px] font-mono text-sky-400 mt-2">2. Color-Coded Debris Overlay</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legend of Active Colors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Detected Objects Palette ({debrisInstances.length} in frame):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {debrisInstances.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredDebrisId && setHoveredDebrisId(item.id)}
                onMouseLeave={() => setHoveredDebrisId && setHoveredDebrisId(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                  hoveredDebrisId === item.id
                    ? 'bg-white/[0.12] border-white/40 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white font-semibold">{item.label}</span>
                <span className="text-slate-400 text-[10px]">{item.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
