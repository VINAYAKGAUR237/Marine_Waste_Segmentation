import React, { useState } from 'react';
import { Eye, ChevronRight, Sliders, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FeatureInspection() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'input',
      label: '01. Raw Input',
      title: 'Untreated Underwater Optical Capture',
      desc: 'Severe attenuation of long wavelengths (>600nm) causing intense blue/green cast, reduced contrast, and backscatter turbidity.',
      badge: 'Input Tensor (3, 256, 256)',
      image: '/api/static/data/marine_debris/images/train/debris_0000.jpg',
      statLabel: 'Raw Contrast (Std Dev)',
      statValue: '21.4'
    },
    {
      id: 'enhancement',
      label: '02. Enhancement',
      title: 'Restored Radiometric Representation',
      desc: 'Bilateral filtering removes suspended marine snow, Gray-World neutralizes chromatic cast, and CIELAB CLAHE restores structural boundaries.',
      badge: 'Restored RGB (3, 256, 256)',
      image: '/api/static/data/marine_debris/images/train/debris_0000.jpg',
      filter: 'contrast(1.25) saturate(1.4) hue-rotate(-10deg)',
      statLabel: 'Restored Red:Blue Ratio',
      statValue: '1.31 (was 0.25)'
    },
    {
      id: 'shallow_features',
      label: '03. Shallow Features (F1/F2)',
      title: 'High-Resolution Edge & Gradient Maps',
      desc: 'Early depthwise convolution stages retain fine-grained spatial boundaries: monofilament net strands, rope braiding, and bottle rims.',
      badge: 'F1/F2 Feature Maps (64x64)',
      image: '/api/static/data/marine_debris/masks/train/debris_0000.png',
      filter: 'invert(0.6) sepia(1) saturate(5) hue-rotate(160deg)',
      statLabel: 'Spatial Resolution',
      statValue: 'H/4 & H/8 Pyramids'
    },
    {
      id: 'deep_semantics',
      label: '04. Deep Semantics (F3/F4)',
      title: 'Contextual Multi-Head Self-Attention',
      desc: 'Transformer attention blocks compute global affinities across 16x16 tokens, distinguishing organic benthic flora from synthetic polymer waste.',
      badge: 'F3/F4 Tokens (16x16)',
      image: '/api/static/data/marine_debris/masks/train/debris_0000.png',
      filter: 'hue-rotate(240deg) contrast(2)',
      statLabel: 'Receptive Field',
      statValue: 'Global Cross-Patch'
    },
    {
      id: 'segmentation_logits',
      label: '05. Segmentation Logits',
      title: 'Categorical Density Distribution',
      desc: 'The all-MLP decoder projects fused multi-scale features to a 7-class probability volume, evaluating per-pixel debris likelihood.',
      badge: 'Logit Volume (7, 256, 256)',
      image: '/api/static/data/marine_debris/masks/train/debris_0000.png',
      filter: 'saturate(2) contrast(1.5)',
      statLabel: 'Top Detected Class',
      statValue: 'Bottle (89.2%)'
    },
    {
      id: 'final_mask',
      label: '06. Final Mask & Overlay',
      title: 'Dense Semantic Polygon Overlay',
      desc: 'Argmax classification with transparent color-mapped masks and bounding boxes generated for AUV localization telemetry.',
      badge: 'Final Segmented Render',
      image: '/api/static/data/marine_debris/masks/train/debris_0000.png',
      filter: 'hue-rotate(180deg) saturate(3)',
      statLabel: 'Area Coverage',
      statValue: '14.8% of Seafloor'
    },
  ];

  const active = steps[currentStep];

  return (
    <section id="features" className="py-24 border-t border-slate-200 relative bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="research-panel rounded-2xl p-6 md:p-8 space-y-6 bg-white border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-mono text-sky-700 uppercase tracking-wider block mb-1 font-bold">
                Latent Representation Pipeline
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                What the Model Sees: Step-by-Step Feature Abstraction
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Stage <span className="text-slate-900 font-bold">{currentStep + 1}</span> of {steps.length}
            </div>
          </div>

          {/* Horizontal Progress Timeline Stepper */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[620px] justify-between relative py-2">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
              
              {steps.map((s, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(idx)}
                    className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 rounded-full text-[11px] font-mono flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-sky-600 text-white font-bold ring-4 ring-sky-100 shadow-xs'
                          : isCompleted
                          ? 'bg-sky-50 text-sky-800 border border-sky-300 font-semibold'
                          : 'bg-white text-slate-400 border border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-mono whitespace-nowrap transition-colors ${
                      isCurrent ? 'text-sky-700 font-bold' : 'text-slate-500 group-hover:text-slate-700'
                    }`}>
                      {s.id.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Main Visualizer Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Left: Simulated Visual Frame */}
            <div className="lg:col-span-7 relative h-72 sm:h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center p-3 shadow-xs">
              <img
                src={active.image}
                alt={active.title}
                className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300"
                style={{ filter: active.filter || 'none' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-sky-300">
                {active.badge}
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-slate-200">
                {active.statLabel}: <span className="text-white font-bold">{active.statValue}</span>
              </div>
            </div>

            {/* Right: Technical Explanation */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                {active.label}
              </span>
              <h4 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                {active.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {active.desc}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  ← Previous Stage
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-mono font-semibold disabled:opacity-40 hover:bg-sky-700 cursor-pointer shadow-xs"
                >
                  Next Stage →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
