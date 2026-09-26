import React, { useState } from 'react';
import { Cpu, Layers, Sparkles, Sliders, Eye, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ArchitectureViewer() {
  const [selectedNode, setSelectedNode] = useState('mit_b0');

  const architectureData = {
    input: {
      name: 'Underwater Input Tensor',
      type: 'Tensor Dimension',
      shape: '(Batch, 3, 256, 256)',
      role: 'Raw BGR underwater image captured by AUV or subsea ROV payload.',
      details: 'Normalized through ImageNet mean and variance scaling after optional physical optical restoration.',
      params: '0 (Input)',
      flops: '0',
    },
    mit_b0: {
      name: 'MiT-B0 Hierarchical Transformer Encoder',
      type: 'Backbone Feature Extractor',
      shape: 'Multi-Stage Pyramidal Features (F1..F4)',
      role: 'Extracts spatial textures and global contextual dependencies through lightweight multi-head self-attention.',
      details: 'Utilizes overlapped patch merging and spatial reduction attention (SRA) to bound compute complexity from O(N²) to O(N²/R).',
      params: '3.71M parameters (Backbone total)',
      flops: '2.84 GFLOPs',
    },
    f1_f4: {
      name: 'Multi-Scale Feature Hierarchy (F1 – F4)',
      type: 'Pyramid Representations',
      shape: 'F1: (32, 64, 64), F2: (64, 32, 32), F3: (160, 16, 16), F4: (256, 8, 8)',
      role: 'Provides hierarchical multi-resolution cues: F1/F2 preserve fine debris boundaries; F3/F4 encode scene-level semantics.',
      details: 'Feature channels are simultaneously dispatched to both the optical restoration decoder and the semantic segmentation head.',
      params: 'Shared representation (Zero parameter duplication)',
      flops: 'Intrinsic to backbone',
    },
    enhancement_decoder: {
      name: 'Enhancement Decoder (Residual Conv + Channel Attention)',
      type: 'Optical Restoration Branch',
      shape: 'Progressive Upsampling to (3, 256, 256)',
      role: 'Reconstructs wavelength attenuation and removes backscattering noise via residual blocks and pixel shuffle upsampling.',
      details: 'Channel Attention blocks dynamically prioritize color channels that suffered severe water-column attenuation (primarily red wavelengths 650–700nm).',
      params: '0.48M parameters',
      flops: '1.12 GFLOPs',
    },
    segmentation_decoder: {
      name: 'Segmentation Decoder (All-MLP Multi-Scale)',
      type: 'Dense Semantic Branch',
      shape: 'Projection to (7, 256, 256) Logits',
      role: 'Classifies every pixel into 7 categories: background, bottle, bag, wrapper, net, rope, or other plastics.',
      details: 'Unifies F1–F4 feature maps to an embedding dimension C=256 using lightweight 1x1 MLP projections, then upsamples and fuses.',
      params: '0.36M parameters',
      flops: '0.94 GFLOPs',
    },
    enhanced_output: {
      name: 'Enhanced Underwater Output',
      type: 'Reconstructed RGB Tensor',
      shape: '(Batch, 3, 256, 256)',
      role: 'Optically clear, balanced image for human pilots and downstream scientific telemetry.',
      details: 'Supervised by composite L1 loss + SSIM (Structural Similarity) + Perceptual VGG feature loss during joint training.',
      params: 'Terminal Output',
      flops: '—',
    },
    segmentation_output: {
      name: 'Semantic Segmentation Mask',
      type: 'Pixel-Wise Classification Mask',
      shape: '(Batch, 7, 256, 256)',
      role: 'Dense categorical masks isolating debris boundaries, bounding polygons, and area coverage percentages.',
      details: 'Supervised by combined Dice Loss + Cross-Entropy Loss with class weighting for severe background imbalance.',
      params: 'Terminal Output',
      flops: '—',
    }
  };

  const active = architectureData[selectedNode];

  return (
    <section id="architecture" className="py-24 border-t border-slate-200 relative bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="research-panel rounded-2xl p-6 md:p-8 space-y-8 bg-white border border-slate-200 shadow-sm">
          {/* Section Subheader */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[11px] font-mono text-sky-700 uppercase tracking-wider block mb-1 font-bold">
                Technical Specification // Figure 2
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Joint Multi-Task Architecture Topology
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
              <span>Interactive Component Inspector</span>
            </div>
          </div>

          {/* Main Two-Column Layout: Flow Diagram (Left) + Detailed Technical Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive Diagram Flow (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Node 1: Input */}
              <div
                onClick={() => setSelectedNode('input')}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedNode === 'input'
                    ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs font-bold font-mono">01 // INPUT IMAGE</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">3 × 256 × 256</span>
                </div>
              </div>

              <div className="flex justify-center -my-1 text-sky-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Node 2: MiT-B0 Transformer Backbone */}
              <div
                onClick={() => setSelectedNode('mit_b0')}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedNode === 'mit_b0'
                    ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold font-mono">02 // MiT-B0 HIERARCHICAL ENCODER</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-semibold">
                    Shared Backbone
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 font-sans">
                  Lightweight Hierarchical Vision Transformer with Overlapped Patch Merging & SRA
                </p>
              </div>

              <div className="flex justify-center -my-1 text-sky-400">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Node 3: Multi-Scale Pyramids (F1 - F4) */}
              <div
                onClick={() => setSelectedNode('f1_f4')}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedNode === 'f1_f4'
                    ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-slate-800">
                    03 // SHARED MULTI-SCALE PYRAMID (F1 ── F2 ── F3 ── F4)
                  </span>
                  <span className="text-[10px] font-mono text-sky-700 font-bold">Unified Memory</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">F1 (1/4)</div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">F2 (1/8)</div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">F3 (1/16)</div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">F4 (1/32)</div>
                </div>
              </div>

              {/* Branch Fork Arrows */}
              <div className="grid grid-cols-2 gap-4 text-sky-400 text-center -my-1">
                <div className="flex justify-center"><ArrowDown className="w-4 h-4" /></div>
                <div className="flex justify-center"><ArrowDown className="w-4 h-4" /></div>
              </div>

              {/* Dual Branch Decoders: Enhancement vs Segmentation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Branch A: Enhancement Decoder */}
                <div
                  onClick={() => setSelectedNode('enhancement_decoder')}
                  className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    selectedNode === 'enhancement_decoder'
                      ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-sky-700 uppercase block mb-1 font-bold">Branch A</span>
                    <h4 className="text-xs font-bold font-mono text-slate-900 mb-1.5">
                      ENHANCEMENT DECODER
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      Residual Conv + Pixel Shuffle + Channel Attention
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                    Shape: Up to 256×256
                  </div>
                </div>

                {/* Branch B: Segmentation Decoder */}
                <div
                  onClick={() => setSelectedNode('segmentation_decoder')}
                  className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    selectedNode === 'segmentation_decoder'
                      ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-sky-700 uppercase block mb-1 font-bold">Branch B</span>
                    <h4 className="text-xs font-bold font-mono text-slate-900 mb-1.5">
                      SEGMENTATION DECODER
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      All-MLP Multi-Scale Unified Projection
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                    Classes: 7 Waste Categories
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 text-sky-400 text-center -my-1">
                <div className="flex justify-center"><ArrowDown className="w-4 h-4" /></div>
                <div className="flex justify-center"><ArrowDown className="w-4 h-4" /></div>
              </div>

              {/* Outputs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedNode('enhanced_output')}
                  className={`p-3 rounded-lg cursor-pointer text-center border text-xs font-mono font-semibold transition-all ${
                    selectedNode === 'enhanced_output'
                      ? 'bg-sky-50 border-2 border-sky-600 text-sky-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                  }`}
                >
                  ENHANCED IMAGE (RGB)
                </div>
                <div
                  onClick={() => setSelectedNode('segmentation_output')}
                  className={`p-3 rounded-lg cursor-pointer text-center border text-xs font-mono font-semibold transition-all ${
                    selectedNode === 'segmentation_output'
                      ? 'bg-sky-50 border-2 border-sky-600 text-sky-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                  }`}
                >
                  SEGMENTATION MASK (7 CH)
                </div>
              </div>

            </div>

            {/* Right Column: Component Inspector Card (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-sky-50/50 via-white to-white border border-sky-200 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-sky-700 uppercase tracking-wider block font-bold">
                  {active.type}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1 font-sans">
                  {active.name}
                </h4>
              </div>

              <div className="space-y-3 text-xs leading-relaxed font-sans">
                <div>
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5 font-semibold">Primary Objective</span>
                  <p className="text-slate-700">{active.role}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5 font-semibold">Mechanism & Math</span>
                  <p className="text-slate-600">{active.details}</p>
                </div>
              </div>

              {/* Metric Telemetry Grid */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tensor Shape:</span>
                  <span className="text-slate-900 font-bold">{active.shape}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Parameters:</span>
                  <span className="text-sky-700 font-bold">{active.params}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Computation:</span>
                  <span className="text-emerald-700 font-bold">{active.flops}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Click any block in the schematic to inspect layer specs.
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
