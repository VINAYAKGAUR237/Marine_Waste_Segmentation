import React, { useState } from 'react';
import { Compass, Navigation, Radio, MapPin, Target, Eye, Maximize, Ruler } from 'lucide-react';
import { DEBRIS_COLOR_PALETTE } from './DetectionViewer';

export default function SpatialLocationMap({ 
  result, 
  hoveredDebrisId, 
  setHoveredDebrisId 
}) {
  const [selectedPair, setSelectedPair] = useState(null);

  if (!result || !result.predictions) return null;

  // Flatten debris items with their centroids
  const items = [];
  result.predictions.forEach((pred, pIdx) => {
    const className = pred.class_name || 'other_debris';
    const meta = DEBRIS_COLOR_PALETTE[className] || DEBRIS_COLOR_PALETTE.other_debris;

    const boxes = Array.isArray(pred.bounding_boxes) && pred.bounding_boxes.length > 0
      ? pred.bounding_boxes
      : [{ x: 50, y: 50, width: 80, height: 80, centroid_x: 90, centroid_y: 90 }];

    boxes.forEach((box, bIdx) => {
      const id = `debris_${className}_${pIdx}_${bIdx}`;
      const cx = box.centroid_x || Math.round(box.x + box.width / 2);
      const cy = box.centroid_y || Math.round(box.y + box.height / 2);

      items.push({
        id,
        index: items.length + 1,
        class_name: className,
        label: meta.label,
        icon: meta.icon,
        color: meta.colorHex,
        glow: meta.glow,
        cx,
        cy,
        // Normalized coordinates in percentage (0 to 100%)
        relX: (cx / 256) * 100,
        relY: (cy / 256) * 100,
        width: box.width,
        height: box.height,
        area: pred.area_percentage,
      });
    });
  });

  // Calculate relative distance vectors between all pairs of debris
  const distanceVectors = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const distPx = Math.round(Math.sqrt(dx * dx + dy * dy));
      // Estimate metric distance (approx 100px ~ 0.8 meters under standard benthic ROV camera FOV)
      const distMeters = (distPx * 0.008).toFixed(2);

      // Calculate bearing angle (0 deg = North)
      let angle = Math.round((Math.atan2(dx, -dy) * 180) / Math.PI);
      if (angle < 0) angle += 360;

      let direction = 'N';
      if (angle >= 22.5 && angle < 67.5) direction = 'NE';
      else if (angle >= 67.5 && angle < 112.5) direction = 'E';
      else if (angle >= 112.5 && angle < 157.5) direction = 'SE';
      else if (angle >= 157.5 && angle < 202.5) direction = 'S';
      else if (angle >= 202.5 && angle < 247.5) direction = 'SW';
      else if (angle >= 247.5 && angle < 292.5) direction = 'W';
      else if (angle >= 292.5 && angle < 337.5) direction = 'NW';

      distanceVectors.push({
        from: a,
        to: b,
        distPx,
        distMeters,
        angle,
        direction,
        pairKey: `${a.id}_${b.id}`,
      });
    }
  }

  // Calculate center of mass / cluster centroid of all debris
  const centerOfMass = items.length > 0 ? {
    cx: Math.round(items.reduce((acc, it) => acc + it.cx, 0) / items.length),
    cy: Math.round(items.reduce((acc, it) => acc + it.cy, 0) / items.length),
  } : { cx: 128, cy: 128 };

  return (
    <div className="rounded-3xl bg-[#0c0e14]/90 border border-white/[0.08] p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Relative Spatial Location Map</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Seabed Debris Location & Relative Spatial Proximity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            2D benthic coordinate radar mapping where each debris piece was found relative to other debris.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sonar Radar Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================================
            2D BENTHIC RADAR COORDINATE MAP (Shows debris positions relative to each other)
           ======================================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[420px] rounded-2xl bg-[#05070a] border border-white/[0.08] p-3 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            {/* Concentric Sonar Distance Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[25%] h-[25%] rounded-full border border-white/[0.04]" />
              <div className="w-[50%] h-[50%] rounded-full border border-white/[0.04]" />
              <div className="w-[75%] h-[75%] rounded-full border border-white/[0.04]" />
              <div className="w-[95%] h-[95%] rounded-full border border-white/[0.05]" />
              {/* Radar Crosshairs */}
              <div className="absolute w-full h-[1px] bg-white/[0.04]" />
              <div className="absolute h-full w-[1px] bg-white/[0.04]" />
            </div>

            {/* Rotating Sonar Radar Sweep Beam */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-full animate-radar-sweep">
                <div 
                  className="w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    background: 'conic-gradient(from 180deg at 100% 100%, transparent 60deg, rgba(16, 185, 129, 0.15) 88deg, rgba(56, 189, 248, 0.4) 90deg, transparent 90deg)',
                  }}
                />
              </div>
            </div>

            {/* Relative Vectors Connecting Debris Objects */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {distanceVectors.map((vec, i) => {
                const isSelected = selectedPair === vec.pairKey;
                const isHovered = hoveredDebrisId === vec.from.id || hoveredDebrisId === vec.to.id;

                return (
                  <g key={i}>
                    {/* Dashed relative proximity line */}
                    <line
                      x1={`${vec.from.relX}%`}
                      y1={`${vec.from.relY}%`}
                      x2={`${vec.to.relX}%`}
                      y2={`${vec.to.relY}%`}
                      stroke={isSelected || isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'}
                      strokeWidth={isSelected || isHovered ? 2 : 1.2}
                      strokeDasharray="4 4"
                    />
                    {/* Midpoint Distance Label */}
                    <rect
                      x={`${(vec.from.relX + vec.to.relX) / 2 - 14}%`}
                      y={`${(vec.from.relY + vec.to.relY) / 2 - 4}%`}
                      width="28%"
                      height="8%"
                      rx="4"
                      fill="#08090a"
                      opacity="0.8"
                    />
                    <text
                      x={`${(vec.from.relX + vec.to.relX) / 2}%`}
                      y={`${(vec.from.relY + vec.to.relY) / 2 + 1}%`}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {vec.distPx}px (~{vec.distMeters}m)
                    </text>
                  </g>
                );
              })}

              {/* Cluster Centroid Marker */}
              {items.length > 1 && (
                <circle
                  cx={`${(centerOfMass.cx / 256) * 100}%`}
                  cy={`${(centerOfMass.cy / 256) * 100}%`}
                  r="4"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </svg>

            {/* Debris Target Blips on Radar */}
            {items.map((item) => {
              const isHovered = hoveredDebrisId === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredDebrisId && setHoveredDebrisId(item.id)}
                  onMouseLeave={() => setHoveredDebrisId && setHoveredDebrisId(null)}
                  style={{
                    left: `${item.relX}%`,
                    top: `${item.relY}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform duration-200 ${
                    isHovered ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  {/* Outer pulsating sonar wave */}
                  <div
                    className="absolute -inset-2 rounded-full animate-radar-ping opacity-40"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* Radar Target Core */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-md border border-white/50"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 12px ${item.color}`,
                    }}
                  >
                    {item.index}
                  </div>

                  {/* Debris Tooltip / Label */}
                  <div 
                    className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#090b10] border border-white/10 text-[9px] font-mono text-white whitespace-nowrap shadow-lg flex items-center gap-1 pointer-events-none"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            })}

            {/* Radar Compass Orientations */}
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-500">N (0°)</span>
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-500">S (180°)</span>
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-500">W (270°)</span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-500">E (90°)</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Debris Target Blip</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-[1px] bg-slate-400 border-b border-dashed" />
              <span>Inter-Debris Relative Distance</span>
            </span>
          </div>
        </div>

        {/* =======================================================================
            RELATIVE PROXIMITY & BEARING TABLE (How each piece relates to others)
           ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-400" />
                <span>Inter-Debris Distance Vectors</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {distanceVectors.length} relative pairs
              </span>
            </div>

            {distanceVectors.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {distanceVectors.map((vec, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => {
                      setHoveredDebrisId && setHoveredDebrisId(vec.from.id);
                      setSelectedPair(vec.pairKey);
                    }}
                    onMouseLeave={() => {
                      setHoveredDebrisId && setHoveredDebrisId(null);
                      setSelectedPair(null);
                    }}
                    className={`p-2.5 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                      selectedPair === vec.pairKey
                        ? 'bg-white/[0.08] border-sky-400/50 shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-slate-300 font-semibold truncate max-w-[170px]">
                        <span>#{vec.from.index} {vec.from.label.split(' ')[0]}</span>
                        <span className="text-slate-500">➔</span>
                        <span>#{vec.to.index} {vec.to.label.split(' ')[0]}</span>
                      </div>
                      <span className="font-bold text-sky-400">
                        {vec.distPx} px
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Approx. ~{vec.distMeters} meters apart</span>
                      <span className="text-emerald-400 font-semibold">
                        Bearing: {vec.angle}° {vec.direction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/20 text-center text-slate-400 text-xs">
                {items.length === 1 
                  ? 'Single debris detected in frame. Relative distance requires 2 or more debris objects.'
                  : 'No debris detected in this frame.'}
              </div>
            )}
          </div>

          {/* Spatial Cluster Characteristics */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Seabed Spatial Distribution Analysis
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block text-[9px] uppercase">Cluster Center</span>
                <span className="text-slate-200 font-bold">X:{centerOfMass.cx}, Y:{centerOfMass.cy}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-500 block text-[9px] uppercase">Dispersion Spread</span>
                <span className="text-slate-200 font-bold">
                  {distanceVectors.length > 0 
                    ? `${Math.round(distanceVectors.reduce((a, v) => a + v.distPx, 0) / distanceVectors.length)} px avg` 
                    : 'N/A (single object)'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
              Relative spatial layout helps maritime robotic ROVs plan robotic arm collection trajectories across the seabed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
