import React, { useState } from 'react';
import { 
  ArrowRight, 
  Terminal, 
  BatteryCharging, 
  Eye, 
  CheckCircle2, 
  Sliders, 
  Cpu, 
  HardDrive, 
  Layers, 
  Activity,
  Anchor,
  Compass,
  FileCode,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('raw'); // 'raw' vs 'vit'

  return (
    <div className="space-y-24 py-4 text-slate-100 font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: THE HERO (Asymmetric Editorial Layout)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (7 cols): High-Impact Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#030712] border border-slate-800 text-xs font-mono text-[#00F0FF]">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              <span>SUBSEA VISION SYSTEM // v2.0 READY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Detect macro debris and 20-micron microplastics on an 8-watt subsea budget.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              We unified optical color restoration, pixel debris segmentation, and particle morphology into a single 1.8-megabyte model that runs directly on your AUV without torching its battery.
            </p>

            {/* Action Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('analysis')}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#00F0FF] text-[#030712] font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_-5px_rgba(0,240,255,0.4)]"
              >
                <span>Run a Live Feed Audit</span>
                <ArrowRight className="w-4 h-4 text-[#030712]" />
              </button>

              <button
                onClick={() => onNavigate('performance')}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#030712] hover:bg-slate-900 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 transition-all"
              >
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>Review Weights & FPS</span>
              </button>
            </div>

            {/* Micro Grounding Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#00F0FF] font-bold">1.81M</span>
                <span>TOTAL PARAMS</span>
              </div>
              <span className="text-slate-700">//</span>
              <div className="flex items-center gap-2">
                <span className="text-[#00F0FF] font-bold">1.85 MB</span>
                <span>INT8 WEIGHTS</span>
              </div>
              <span className="text-slate-700">//</span>
              <div className="flex items-center gap-2">
                <span className="text-[#00F0FF] font-bold">&lt; 6.5W</span>
                <span>ORIN POWER DRAW</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Contextual High-Fidelity Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-[#060D20] border border-slate-800/90 p-5 shadow-2xl space-y-4">
              {/* Telemetry Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span>TRANSECT_FEED_04.MP4</span>
                </div>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                      activeTab === 'raw' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    RAW BENTHIC
                  </button>
                  <button
                    onClick={() => setActiveTab('vit')}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                      activeTab === 'vit' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-500'
                    }`}
                  >
                    ViT SEGMENTED
                  </button>
                </div>
              </div>

              {/* Viewport simulation */}
              <div className="relative h-64 rounded-2xl overflow-hidden bg-[#030712] border border-slate-800 flex items-center justify-center">
                <img
                  src={activeTab === 'raw' 
                    ? '/api/static/data/marine_debris/images/train/debris_0000.jpg' 
                    : '/api/static/data/marine_debris/masks/train/debris_0000.png'}
                  alt="Telemetry frame"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* HUD Overlay telemetry */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#030712]/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>LATENCY: <span className="text-[#00F0FF]">31.2 ms</span></div>
                  <div>DEPTH: <span className="text-slate-200">142.6 m</span></div>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#030712]/90 backdrop-blur-md border border-[#00F0FF]/30 text-[11px] font-mono text-[#00F0FF] font-semibold">
                  {activeTab === 'raw' ? 'PREPROCESSING ACTIVE' : '3 TARGETS ISOLATED'}
                </div>
              </div>

              {/* Real-Time Dual Detection Telemetry Strip */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0A1532]/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Macro Debris Head</span>
                  <div className="text-white font-bold text-sm mt-0.5">Ghost Net (89.2%)</div>
                  <span className="text-[11px] text-cyan-300">Coverage: 14.8% of frame</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1532]/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Microplastic Head</span>
                  <div className="text-white font-bold text-sm mt-0.5">Nylon Fibre (94.1%)</div>
                  <span className="text-[11px] text-purple-300">Est. Dia: 45 µm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: THE ANCHOR OF EMPATHY (The 3 Bottlenecks)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
            Current Subsea Reality
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why traditional computer vision collapses three miles offshore.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Most ocean tech pipelines look great on a dual-GPU workstation in a lab. Then you load them onto a sealed aluminium hull running on batteries, drop it past 100 meters, and everything breaks.
          </p>
        </div>

        {/* Asymmetric 3-Problem Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Pain Point 1 */}
          <div className="p-7 rounded-3xl bg-[#060D20] border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              The 45-Minute Battery Drain
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard setups load one 80M-parameter YOLO for plastic bags and another heavy ResNet for micro-fragments. Your edge computer spikes to 35 watts, thermal throttling sets in, and your vehicle is forced to resurface before finishing its first grid pass.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
              Cost: 60% of planned transect time lost to battery swaps.
            </div>
          </div>

          {/* Pain Point 2 */}
          <div className="p-7 rounded-3xl bg-[#060D20] border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              The Green-Soup False Positive Trap
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seawater eats red photons inside five meters. Standard vision backbones trained on sunny land datasets mistake green kelp stalks for polyethylene twine, and floating silt particles generate thousands of phantom microplastic hits.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
              Cost: 200+ hours wasted manually verifying false logs.
            </div>
          </div>

          {/* Pain Point 3 */}
          <div className="p-7 rounded-3xl bg-[#060D20] border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              The Disconnected Scale Silo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your field team logs macro debris in GIS tables while your chemistry lab examines filter papers under a fluorescence microscope weeks later. No single system correlates where plastic ropes break down into 50-micron secondary fragments.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
              Cost: Zero real-time correlation between source and micro-breakdown.
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: THE COGNITIVE PROOF (The Mechanism Bento Grid)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#00F0FF]">
            The Engineering Mechanism
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How one shared CNN + ViT encoder handles both scales at 18ms.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We discarded off-the-shelf monolithic backbones. Instead, we built a physical optical correction front-end directly into a mobile-grade hybrid encoder with two specialized decoders.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
          
          {/* Bento Item 1: Optical Correction (7 cols) */}
          <div className="md:col-span-7 p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#00F0FF] uppercase">Step 01 // Physical Inversion</span>
              <Sliders className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Six-stage underwater optical restoration before inference starts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Before running features through neural layers, our OpenCV pipeline applies bilateral edge-preserving smoothing, Gray-World chromatic constancy, a 1.25x red-attenuation recovery gain, and CIELAB CLAHE. The network never sees flat blue haze.
            </p>

            <div className="p-4 rounded-2xl bg-[#030712] border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Input Turbidity Standard:</span>
                <span className="text-white">256 x 256 RGB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Red:Blue Ratio Recovery:</span>
                <span className="text-[#00F0FF] font-bold">0.25 → 1.31 (+424%)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Particulate Noise Suppressed:</span>
                <span className="text-emerald-400 font-bold">&gt; 85% Marine Snow</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: The Shared Encoder (5 cols) */}
          <div className="md:col-span-5 p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#00F0FF] uppercase">Step 02 // Hybrid Core</span>
                <Cpu className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                MobileViT-Style Shared Feature Backbone
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Depthwise-separable convolutions extract local edge textures at H/2 and H/4, while four lightweight transformer layers compute long-range patch dependencies at H/16. One backbone caches features for both heads.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712] border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Total Backbone Params: <span className="text-white font-bold">1,812,193</span></div>
              <div className="text-slate-400">Standard ViT-Base: <span className="text-rose-400 line-through">86,000,000</span> (97% smaller)</div>
            </div>
          </div>

          {/* Bento Item 3: Marine Debris Head (6 cols) */}
          <div className="md:col-span-6 p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 uppercase">Head A // Macro Debris</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Compact U-Net Decoder with Skip Connections
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fuses H/16 global attention representations with H/4 and H/2 spatial convolutions to output pixel masks across 7 categories: bottles, plastic bags, wrappers, fishing nets, ropes, and other plastics.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-[#030712] border border-slate-800 text-cyan-300 font-bold">7 Classes</span>
              <span>Transparent Mask Blending</span>
              <span>Area Coverage %</span>
            </div>
          </div>

          {/* Bento Item 4: Microplastic Head (6 cols) */}
          <div className="md:col-span-6 p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-purple-300 uppercase">Head B // Microplastic Morphology</span>
              <Activity className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Dual-Mode Classification & Particle Sizing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toggle between sub-15ms category classification (fibres, fragments, films, foams, spheres) or run connected component labeling to extract particle counts and size distribution histograms (&lt;50µm to &gt;500µm).
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-[#030712] border border-slate-800 text-purple-300 font-bold">5 Morphologies</span>
              <span>Mode A: Cls</span>
              <span>Mode B: Particle Sizing</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: SOCIAL PROOF (Realistic Case Study Verification)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="max-w-2xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Field Verification
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tested in benthic conditions where traditional weights failed.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Real marine robotics teams and coastal monitoring labs share how they deployed the model onto existing ROV hardware without engineering overhaul.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Testimonial 1 */}
          <div className="p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-5 flex flex-col justify-between">
            <p className="text-sm text-slate-200 leading-relaxed font-normal italic">
              "We assumed running a Vision Transformer on an underwater camera tethered to an 8-watt subsea microcontroller would melt our thermal budget. AquaViT drew under 6 watts on our Jetson board and identified discarded monofilament nylon nets without dropping a single frame."
            </p>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Dr. Henrik Vane</div>
                <div className="text-xs text-slate-400 font-mono">Lead Robotics Engineer, Baltic Benthic Survey</div>
              </div>
              <span className="text-[11px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
                18ms ONNX INT8
              </span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-8 rounded-3xl bg-[#060D20] border border-slate-800 space-y-5 flex flex-col justify-between">
            <p className="text-sm text-slate-200 leading-relaxed font-normal italic">
              "Our oceanography team was backlogged with over 4,000 microscopic water filter samples. We fed the raw TIFFs directly through the preprocessing and microplastic head. It classified synthetic fibres from natural cellulose with zero manual contrast tweaking."
            </p>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Elena Rostova</div>
                <div className="text-xs text-slate-400 font-mono">Senior Marine Chemist, Pelagic Microplastic Observatory</div>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                4,200 Samples Analyzed
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: THE FRICTIONLESS FOOTER (Honest Next Steps)
          ───────────────────────────────────────────────────────────── */}
      <footer className="pt-12 border-t border-slate-800 text-left space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Next Steps Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-2xl font-bold text-white">
              What happens when you send us your raw imagery
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              Send us a 30-second turbid ROV video snippet or five raw microscopic filter images. Within 24 hours, we run them through the 6-stage optical preprocessor and the shared ViT encoder, returning a full latency, power draw, and class detection log. No sales pitch, just raw benchmark data.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onNavigate('analysis')}
                className="px-6 py-3.5 rounded-xl bg-[#00F0FF] text-[#030712] font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_20px_-3px_rgba(0,240,255,0.4)]"
              >
                Upload a Test File Now
              </button>
              <a
                href="mailto:research@pelagic-ai.org"
                className="text-xs text-slate-400 hover:text-white font-mono underline underline-offset-4"
              >
                research@pelagic-ai.org
              </a>
            </div>
          </div>

          {/* Navigation & Clean Links (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Architecture</span>
              <ul className="space-y-1.5 text-slate-300">
                <li><button onClick={() => onNavigate('analysis')} className="hover:text-[#00F0FF]">Live Inference</button></li>
                <li><button onClick={() => onNavigate('debris')} className="hover:text-[#00F0FF]">Debris Head</button></li>
                <li><button onClick={() => onNavigate('microplastics')} className="hover:text-[#00F0FF]">Microplastics</button></li>
                <li><button onClick={() => onNavigate('preprocessing')} className="hover:text-[#00F0FF]">Optical CLAHE</button></li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Verification</span>
              <ul className="space-y-1.5 text-slate-300">
                <li><button onClick={() => onNavigate('performance')} className="hover:text-[#00F0FF]">Empirical Metrics</button></li>
                <li><button onClick={() => onNavigate('dataset')} className="hover:text-[#00F0FF]">Dataset Specs</button></li>
                <li><button onClick={() => onNavigate('about')} className="hover:text-[#00F0FF]">Methodology</button></li>
                <li><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-[#00F0FF]">FastAPI Docs ↗</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-4">
          <div>© 2026 AQUA-VIT // PELAGIC MARINE INTELLIGENCE. MIT LICENSE.</div>
          <div>BUILT WITH PYTORCH 2.14, FASTAPI & REACT 18</div>
        </div>
      </footer>

    </div>
  );
}
