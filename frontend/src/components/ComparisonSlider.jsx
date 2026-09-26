import React, { useState, useRef, useCallback } from 'react';

export default function ComparisonSlider({
  leftImage,
  rightImage,
  leftLabel = 'Raw Untreated (Jerlov II)',
  rightLabel = 'Optically Restored & Enhanced',
  heightClass = 'h-[360px] md:h-[460px]'
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPos(pos);
  }, []);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = (e) => {
    if (isDragging.current) {
      updatePosition(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseMove={handlePointerMove}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchMove={handleTouchMove}
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden select-none bg-abyss-900 border border-white/10 cursor-ew-resize group`}
      aria-label="Interactive Optical Image Comparison"
    >
      {/* Right / Base Image */}
      <img
        src={rightImage}
        alt={rightLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded bg-abyss-950/85 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-ocean-300 pointer-events-none">
        {rightLabel}
      </div>

      {/* Left Clipped Layer */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img
          src={leftImage}
          alt={leftLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded bg-abyss-950/85 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-amber-300">
          {leftLabel}
        </div>
      </div>

      {/* Vertical Hairline Divider & Thumb */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize z-30 transition-shadow duration-200 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-abyss-900 border border-white/40 shadow-md flex items-center justify-center text-white text-[10px] font-mono">
          ⇄
        </div>
      </div>
    </div>
  );
}
