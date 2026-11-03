import React from 'react';

/**
 * Hand-drawn-style dotted necklace line connector
 * Connects pipeline beads with an organic, wavy dotted line and glowing white particles.
 */
export default function NecklaceConnector({ direction = 'right', className = '' }) {
  if (direction === 'right') {
    return (
      <div className={`absolute top-1/2 left-[calc(50%+190px)] sm:left-[calc(50%+210px)] right-0 h-16 -translate-y-1/2 pointer-events-none z-0 overflow-visible ${className}`}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 40">
          {/* Hand-drawn organic wave path */}
          <path
            d="M 0,20 C 80,14 160,26 240,18 C 320,24 380,19 450,20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
            className="animate-dotted-line"
            style={{
              filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))',
            }}
          />
          {/* Glowing connector junction bead */}
          <circle cx="2" cy="20" r="3.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 6px #ffffff)' }} />
        </svg>
      </div>
    );
  }

  if (direction === 'left') {
    return (
      <div className={`absolute top-1/2 right-[calc(50%+190px)] sm:right-[calc(50%+210px)] left-0 h-16 -translate-y-1/2 pointer-events-none z-0 overflow-visible ${className}`}>
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 40">
          <path
            d="M -50,20 C 40,24 120,16 220,22 C 300,16 360,21 400,20"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
            className="animate-dotted-line"
            style={{
              filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))',
            }}
          />
          <circle cx="398" cy="20" r="3.5" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 6px #ffffff)' }} />
        </svg>
      </div>
    );
  }

  // Both sides
  return (
    <>
      <NecklaceConnector direction="left" />
      <NecklaceConnector direction="right" />
    </>
  );
}
