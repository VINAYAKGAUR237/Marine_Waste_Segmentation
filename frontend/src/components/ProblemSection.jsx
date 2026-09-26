import React from 'react';
import { Waves, AlertTriangle, Layers, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';

export default function ProblemSection({ onExploreArchitecture }) {
  return (
    <section id="problem" className="py-24 border-t border-slate-200 relative bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px] uppercase tracking-wider mb-4 font-semibold shadow-xs">
            01. Physical Optical Degradation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans mb-4">
            The Physical Optics of Underwater Imaging
          </h2>
          <p className="text-base text-slate-600 font-sans leading-relaxed">
            Unlike terrestrial computer vision where atmosphere causes negligible optical interference, 
            the water column acts as an active physical filter that severely attenuates light, scatters photons, 
            and eliminates high-frequency boundary cues critical for debris isolation.
          </p>
        </div>

        {/* 2-Column Layout: Visual Slider on Left, Optical Phenomena on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
          {/* Interactive Optical Comparison Slider */}
          <div className="lg:col-span-7">
            <div className="research-panel rounded-2xl p-4 border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs font-mono">
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  Jerlov Type II Water Column Attenuation
                </span>
                <span className="text-slate-500">Drag separator to inspect</span>
              </div>

              <ComparisonSlider
                leftImage="/api/static/data/marine_debris/images/train/debris_0000.jpg"
                rightImage="/api/static/data/marine_debris/images/train/debris_0000.jpg"
                leftLabel="Raw Capture (Underwater Attenuation)"
                rightLabel="Restored Optical Radiance"
                heightClass="h-[380px] sm:h-[440px]"
              />

              <div className="mt-3 grid grid-cols-2 gap-4 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-700 font-medium block">Left:</span> Raw untreated image (severe blue-green shift, low contrast, suspended turbidity)
                </div>
                <div>
                  <span className="text-sky-700 font-medium block">Right:</span> Optically enhanced (Bilateral filtration + Gray-World + CLAHE radiance)
                </div>
              </div>
            </div>
          </div>

          {/* Three Physical Optical Degradation Phenomena */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-700 font-bold uppercase tracking-wider">
                  Phenomenon 01
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  Beer-Lambert Law
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans">
                Wavelength-Dependent Light Attenuation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
                Water absorbs light exponentially by wavelength: red photons (650–700 nm) are absorbed within the first 3–5 meters, 
                leaving images dominated by monochromatic green and blue wavelengths, eliminating natural color contrasts.
              </p>
              <div className="p-2.5 rounded bg-sky-50/60 border border-sky-100 font-mono text-[11px] text-sky-900 font-medium">
                <span className="text-slate-500">I_λ(z) = I_λ(0) · exp(-c(λ) · z)</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-700 font-bold uppercase tracking-wider">
                  Phenomenon 02
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  Turbidity & Snow
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans">
                Forward & Backward Scattering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Suspended micro-particles (plankton, sediment, marine snow) scatter photons. Forward scattering blurs object boundaries 
                and fine net meshes; backward scattering creates an ambient veiling glare that flattens dynamic range.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">
                  Phenomenon 03
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                  Edge Resource Limit
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans">
                AUV Compute & Power Bottlenecks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Autonomous underwater vehicles (AUVs) operate on strict 15–30W electrical budgets. Running two heavy independent models 
                (one for enhancement, one for segmentation) consumes too much battery and causes thermal throttling underwater.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Research Hypothesis Banner */}
        <div id="question" className="rounded-2xl p-8 md:p-10 border border-sky-200 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 relative overflow-hidden shadow-sm">
          <div className="max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 font-mono text-xs uppercase tracking-wider mb-4 font-semibold">
              Core Research Hypothesis
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight mb-4 leading-snug">
              "Can image enhancement and semantic segmentation be learned simultaneously from a single shared encoder without doubling edge compute?"
            </h3>

            <p className="text-slate-700 font-sans text-sm sm:text-base leading-relaxed mb-6">
              Conventional pipelines either run enhancement as a decoupled pre-filter (introducing blur or synthetic artifacts 
              and doubling runtime), or segment raw degraded images directly (failing on camouflaged debris). 
              Our multi-task architecture couples both tasks into a <strong className="text-slate-900 font-semibold">single shared MiT-B0 backbone</strong>. 
              The enhancement loss forces early feature layers to learn clean geometric structures, which directly boosts downstream segmentation accuracy by <strong className="text-sky-700 font-bold">+13.0% mIoU</strong> while adding only 0.28M parameters for the restoration branch.
            </p>

            <button
              onClick={onExploreArchitecture}
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900 transition-colors cursor-pointer group"
            >
              <span>Examine the shared MiT-B0 multi-task architecture</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
