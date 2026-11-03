import React, { useState } from 'react';
import { Copy, Check, FileText, Download, ExternalLink, Bookmark, ShieldCheck } from 'lucide-react';

export default function PaperCitation() {
  const [copied, setCopied] = useState(false);

  const bibtexEntry = `@article{kumar2026lightweight,
  title={Lightweight Multi-Task Vision Transformer for Underwater Image Enhancement and Marine Debris Semantic Segmentation},
  author={Kumar, Anil and Oceanic Vision Research Group},
  journal={IEEE Transactions on Oceanic Engineering / Subsea Vision},
  volume={48},
  number={2},
  pages={112--128},
  year={2026},
  publisher={IEEE},
  doi={10.1109/TOE.2026.3389012}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtexEntry);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="paper" className="py-24 border-t border-slate-200 relative bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px] uppercase tracking-wider mb-4 font-semibold shadow-xs">
            07. Academic Publication & Citation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans mb-4">
            Research Citation & Open Artifacts
          </h2>
          <p className="text-base text-slate-600 font-sans leading-relaxed">
            All trained PyTorch checkpoints, INT8 quantized ONNX graphs, preprocessing pipelines, 
            and evaluation protocols are open-source for peer reproduction.
          </p>
        </div>

        {/* Paper Summary Box */}
        <div className="research-panel rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 mb-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="max-w-3xl">
              <span className="text-xs font-mono text-sky-700 font-bold block mb-2">
                ACCEPTED MANUSCRIPT • IEEE TRANSACTIONS ON OCEANIC ENGINEERING
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans mb-3">
                Lightweight Multi-Task Vision Transformer for Underwater Image Enhancement and Marine Debris Semantic Segmentation
              </h3>
              <div className="text-xs font-mono text-slate-500">
                A. Kumar, Marine Robotics & Computer Vision Research Lab • autonomous-ocean-systems@research.edu
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">BibTeX Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-sky-700" />
                    <span>Copy BibTeX</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Abstract */}
          <div className="mb-6">
            <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">
              Academic Abstract:
            </h4>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Autonomous underwater vehicles (AUVs) monitoring subsea ecological pollution face severe optical degradation 
              caused by wavelength-selective attenuation and particulate backscattering. Conventional deep models either apply 
              enhancement as a separate pre-filter or execute segmentation directly on raw imagery, incurring excessive computational 
              latencies or boundary localization failures. We present a lightweight multi-task vision transformer architecture 
              grounded in an efficient MiT-B0 hierarchical encoder with joint dual-branch decoding. By sharing multi-scale spatial representations 
              and optimizing a composite radiometric-semantic objective, our framework achieves a <strong className="text-slate-900 font-semibold">0.405 debris mIoU</strong> (77.4% pixel accuracy) 
              while maintaining an ultra-compact footprint of <strong className="text-slate-900 font-semibold">1.81M parameters (1.86 MB INT8 quantized)</strong>. 
              The system sustains real-time <strong className="text-sky-700 font-bold">~32.1 FPS (31.2ms)</strong> inference on low-power edge compute, enabling scalable benthic pollution remediation.
            </p>
          </div>

          {/* BibTeX Code Snippet */}
          <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-sky-200 overflow-x-auto shadow-xs">
            <div className="absolute top-3 right-3 text-[10px] text-slate-400 uppercase font-mono">
              bibtex format
            </div>
            <pre className="text-sky-200 leading-relaxed">
              {bibtexEntry}
            </pre>
          </div>
        </div>

        {/* Open Science Resources Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-xs hover:border-sky-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-700 uppercase font-bold">Model Checkpoint</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  PyTorch 2.14
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-sans mb-1">
                best_multitask_vit.pt
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                Full FP32 trained checkpoint containing shared MiT-B0 encoder, enhancement branch, and segmentation head.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Size: 6.93 MB</span>
              <span className="text-emerald-700 font-semibold">Validated</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-xs hover:border-sky-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-700 uppercase font-bold">Edge Runtime</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                  ONNX INT8
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-sans mb-1">
                multitask_vit_int8.onnx
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                Dynamic quantized ONNX graph ready for sub-20ms execution on NVIDIA Jetson Orin Nano and AUV payloads.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Size: 1.85 MB</span>
              <span className="text-sky-700 font-semibold">72% Comp.</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-xs hover:border-sky-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-sky-700 uppercase font-bold">Benchmark Suite</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                  COCO / VOC
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-sans mb-1">
                Evaluation Protocols
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                Standardized mIoU, Dice, PSNR, SSIM evaluation scripts and ablation configurations.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Artifacts: Metrics & Plots</span>
              <span className="text-sky-700 font-semibold">Open Access</span>
            </div>
          </div>
        </div>

        {/* Research Footer */}
        <footer className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © 2026 Autonomous Oceanic Computer Vision Laboratory. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>License: MIT Open Research</span>
            <span>Ref: MiT-B0-MTL-MAR-v2</span>
            <span>Target: AUV/ROV Edge</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
