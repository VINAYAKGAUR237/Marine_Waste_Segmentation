import React, { useState, useRef, useCallback } from 'react';

export default function ImageCompareSlider({ 
  leftImage, 
  rightImage, 
  leftLabel = 'Original Underwater', 
  rightLabel = 'Enhanced / Overlay' 
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPosition(pos);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e) => {
    if (isDragging.current) handleMove(e.clientX);
  };

  const onTouchMove = (e) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      className="relative w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden select-none border border-cyan-500/30 shadow-2xl bg-ocean-950 cursor-ew-resize group"
    >
      {/* Right / Background Image */}
      <img
        src={rightImage}
        alt={rightLabel}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-ocean-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-cyan-300 pointer-events-none">
        {rightLabel}
      </div>

      {/* Left / Clipped Overlay Image */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={leftImage}
          alt={leftLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ocean-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-amber-300">
          {leftLabel}
        </div>
      </div>

      {/* Divider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#00E5FF] cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-ocean-900 border-2 border-cyan-400 shadow-glow-cyan flex items-center justify-center text-cyan-300 text-xs font-bold">
          ⇄
        </div>
      </div>
    </div>
  );
}
