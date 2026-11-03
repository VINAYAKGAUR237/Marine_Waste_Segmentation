import React, { useState, useRef } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import NecklaceConnector from './NecklaceConnector';

export default function GlowingUploadLogo({ 
  onFileSelect, 
  isLoading, 
  errorMsg 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    // 1. Check for dropped file
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
      return;
    }

    // 2. Check for dropped web link
    let droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (!droppedUrl) {
      const html = e.dataTransfer.getData('text/html');
      if (html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) droppedUrl = match[1];
      }
    }

    if (droppedUrl && (droppedUrl.startsWith('http://') || droppedUrl.startsWith('https://') || droppedUrl.startsWith('data:image/'))) {
      onFileSelect(droppedUrl);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4">
      {/* Hand-drawn-style dotted line emerging from upload button going to the right of the screen */}
      <NecklaceConnector direction="right" />

      {/* Error alert banner if any */}
      {errorMsg && (
        <div className="absolute top-8 p-3 px-5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center backdrop-blur-md shadow-lg animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      {/* =========================================================================
          THE GLOWING CURVED RECTANGULAR UPLOAD BUTTON AT CENTRE
          (ONLY 1 LONG GLOWING WHITE LIGHT TRAVELING IN A LOOP FOREVER)
         ========================================================================= */}
      <div className="relative group w-full max-w-[380px] sm:max-w-[420px]">
        {/* Ambient background glow */}
        <div 
          className={`absolute -inset-1 rounded-[30px] bg-white/10 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 ${
            isDragging ? 'opacity-80 scale-105' : ''
          }`} 
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full h-[220px] sm:h-[240px] rounded-[28px] bg-[#0c0e14]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${
            isDragging 
              ? 'scale-[1.02] bg-[#121622] border-white/40' 
              : 'hover:scale-[1.01] hover:bg-[#10131c]'
          }`}
        >
          {/* ===================================================================
              SVG: EXACTLY 1 LONG THIN WHITE LIGHT TRAVELING AROUND THE EDGES IN A LOOP
              pathLength="1000" normalizes the total perimeter to 1000.
              strokeDasharray="240 760" guarantees 240 units dash + 760 units gap = 1000.
              Therefore, mathematically ONLY 1 SINGLE DASH exists on the perimeter!
             =================================================================== */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Subtle base static border */}
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

            {/* Glowing diffusion under-layer for the single beam */}
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
              style={{
                filter: 'blur(3px)',
              }}
            />

            {/* The 1 Long Thin White Light (Glowing intensely in a continuous infinite loop) */}
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

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.jfif,.bmp,.tiff"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Central Upload Icon */}
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mb-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:border-white/30 group-hover:bg-white/[0.1] transition-all">
            {isLoading ? (
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            )}
          </div>

          {/* Only "Upload image" text as explicitly requested */}
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
            Upload image
          </span>
        </div>
      </div>
    </div>
  );
}
