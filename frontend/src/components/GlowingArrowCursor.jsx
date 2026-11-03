import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function GlowingArrowCursor({ hasNext, hasPrev, onNext, onPrev }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState(null); // 'left', 'right', or null

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const width = window.innerWidth;
      const rightThreshold = width * 0.82;
      const leftThreshold = width * 0.18;

      if (e.clientX > rightThreshold && hasNext) {
        setHoverSide('right');
      } else if (e.clientX < leftThreshold && hasPrev) {
        setHoverSide('left');
      } else {
        setHoverSide(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hasNext, hasPrev]);

  return (
    <>
      {/* Right Edge Click Zone */}
      {hasNext && (
        <div
          onClick={onNext}
          title="Click to go to next step"
          className="fixed top-0 right-0 w-[18vw] h-full z-40 cursor-pointer flex items-center justify-end pr-8 group"
        >
          {/* Static Ambient Right Arrow Indicator if mouse not directly on edge */}
          <div className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <ArrowRight className="w-5 h-5 animate-pulse text-white drop-shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      )}

      {/* Left Edge Click Zone */}
      {hasPrev && (
        <div
          onClick={onPrev}
          title="Click to go to previous step"
          className="fixed top-0 left-0 w-[18vw] h-full z-40 cursor-pointer flex items-center justify-start pl-8 group"
        >
          {/* Static Ambient Left Arrow Indicator */}
          <div className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <ArrowLeft className="w-5 h-5 animate-pulse text-white drop-shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      )}

      {/* Custom Glowing Cursor Following Mouse on Right Side */}
      {hoverSide === 'right' && hasNext && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="w-14 h-14 rounded-full bg-[#0c0e14]/90 border-2 border-white backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_#ffffff,0_0_40px_rgba(255,255,255,0.8)] animate-arrow-pulse">
            <ArrowRight className="w-6 h-6 text-white drop-shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      )}

      {/* Custom Glowing Cursor Following Mouse on Left Side */}
      {hoverSide === 'left' && hasPrev && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="w-14 h-14 rounded-full bg-[#0c0e14]/90 border-2 border-white backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_#ffffff,0_0_40px_rgba(255,255,255,0.8)] animate-arrow-pulse">
            <ArrowLeft className="w-6 h-6 text-white drop-shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>
      )}
    </>
  );
}
