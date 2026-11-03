import React from 'react';
import { Camera, Sparkles, Cpu, GitFork, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

export default function PipelineTimeline() {
  const pipelineSteps = [
    {
      num: '01',
      title: 'Underwater Optical Acquisition',
      tag: 'Raw Sensor Data',
      icon: Camera,
      summary: 'Capture in-situ underwater imagery across Jerlov coastal and oceanic water types, subject to wavelength attenuation and particulate backscatter.',
      detail: 'Sensors record radiometric distortions where red wavelengths are absorbed within the first 5m and turbidity causes ambient veiling glare.',
      tech: 'RGB / Multispectral • 256×256 Tensors • 5m–120m depths'
    },
    {
      num: '02',
      title: 'Radiometric Physical Restoration',
      tag: 'Preprocessing Baseline',
      icon: Sparkles,
      summary: 'Application of physics-based optical corrections to reconstruct degraded color balance and recover low-contrast structural boundaries.',
      detail: 'Gray-World color constancy counteracts chromatic shift; CLAHE expands luminance histograms; Bilateral filtering removes suspended marine snow.',
      tech: 'Gray-World • CIELAB CLAHE • Bilateral Spatial Filtering'
    },
    {
      num: '03',
      title: 'Hierarchical MiT-B0 Encoding',
      tag: 'Shared Representation',
      icon: Cpu,
      summary: 'Lightweight Vision Transformer backbone processes patches through 4 progressive stages with Spatial Reduction Attention (SRA).',
      detail: 'Reduces self-attention complexity from O(N²) to O(N²/R) while extracting hierarchical pyramid representations F1 (H/4) to F4 (H/32).',
      tech: 'MiT-B0 • Overlapped Patch Merging • SRA Complexity O(N²/R)'
    },
    {
      num: '04',
      title: 'Joint Multi-Task Feature Dispersal',
      tag: 'Gradient Balancing',
      icon: GitFork,
      summary: 'Dual loss functions backpropagate gradients into the shared encoder, regularizing boundary representations without parameter duplication.',
      detail: 'The combined loss L = α·L_Dice + β·L_CE + γ·L_L1 balances dense semantic boundary isolation with optical radiance fidelity.',
      tech: 'Joint Objective L_total = L_seg + λ·L_enh • Shared Pyramids'
    },
    {
      num: '05',
      title: 'Dual-Branch Decoding',
      tag: 'Task Output Heads',
      icon: Layers,
      summary: 'Parallel decoders simultaneously reconstruct clean 3-channel optical radiances and dense multi-class segmentation logits.',
      detail: 'Branch A uses residual blocks with channel attention to restore attenuated wavelengths; Branch B uses lightweight MLP heads for pixel masks.',
      tech: 'Residual Conv + Channel Attention • Lightweight All-MLP Decoder'
    },
    {
      num: '06',
      title: 'Edge-Quantized Deployment',
      tag: 'AUV / ROV Runtime',
      icon: ShieldCheck,
      summary: 'Model graph is exported to ONNX format with INT8 dynamic quantization for microsecond edge inference on submersibles.',
      detail: 'Compacted from 6.93MB (FP32) to 1.86MB (INT8) sustaining real-time ~32 FPS inference on edge hardware.',
      tech: 'INT8 Dynamic Quantization • ONNX Runtime • 31.2ms Latency'
    }
  ];

  return (
    <section className="py-24 border-t border-slate-200 relative bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px] uppercase tracking-wider mb-4 font-semibold shadow-xs">
            05. Methodology & Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans mb-4">
            End-to-End Multi-Task Research Pipeline
          </h2>
          <p className="text-base text-slate-600 font-sans leading-relaxed">
            From raw photons captured in murky benthic trenches to microsecond quantized inference on AUV edge compute: 
            the 6 progressive stages of the research pipeline.
          </p>
        </div>

        {/* 6-Step Chronological Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-bold text-sky-600">
                        {step.num}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                        {step.tag}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:bg-sky-100 group-hover:border-sky-200 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-sans mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed mb-3">
                    {step.summary}
                  </p>

                  <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
                    {step.detail}
                  </p>
                </div>

                {/* Tech Badge Footer */}
                <div className="pt-3 border-t border-slate-100 font-mono text-[10px] text-sky-700 font-semibold">
                  {step.tech}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
