import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Download, Layers, Anchor, CheckCircle2, Cpu, HardDrive } from 'lucide-react';
import { exportModel } from '../services/api';

export default function AboutProject() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const handleExportONNX = async () => {
    setIsExporting(true);
    try {
      const res = await exportModel('onnx', true);
      setExportResult(res.details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Title */}
      <div className="glass-panel-glow rounded-3xl p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-3">
          <BookOpen className="w-3.5 h-3.5" /> Research Synopsis & Architectural Specification
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
          Lightweight Multi-Task Vision Transformer for Marine Debris and Microplastic Segmentation
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Designed for autonomous underwater vehicles (AUVs), remotely operated vehicles (ROVs), and coastal monitoring systems. Addresses marine pollution across two distinct visual scales through a single shared, highly-efficient CNN + Vision Transformer encoder.
        </p>
      </div>

      {/* Core Research Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            1. Unified Multi-Task Design
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conventional ocean monitoring deploys separate models for macro debris (e.g. YOLO/Mask R-CNN) and microscopy microplastics (e.g. ResNet/ViT). This project unifies both objectives into ONE shared lightweight CNN-Transformer encoder, slashing memory footprint by 75% while capturing shared structural texture features.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            2. Low-Resource Edge Feasibility
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            By substituting quadratic standard Vision Transformer self-attention with depthwise separable hybrid blocks (MobileViT principle) and reduced projection dimensions, the total model footprint is restricted to only 1.81 million parameters (~6.9 MB FP32), deployable on edge boards like Jetson Orin Nano and Raspberry Pi 5.
          </p>
        </div>
      </div>

      {/* Mathematical Loss Formulation */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Mathematical Formulation of Multi-Task Loss</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The joint optimization combines Dice loss and Cross Entropy loss for pixel segmentation, with Cross Entropy loss for particle classification:
        </p>

        <div className="p-4 rounded-xl bg-ocean-950 border border-slate-800 text-xs font-mono text-cyan-300 space-y-2">
          <div>ℒ_debris = 0.6 · ℒ_Dice(y_mask, ŷ_mask) + 0.4 · ℒ_CE(y_mask, ŷ_mask)</div>
          <div>ℒ_microplastic = ℒ_CE(y_cls, ŷ_cls)</div>
          <div className="text-emerald-300 font-bold">ℒ_total = λ₁ · ℒ_debris + λ₂ · ℒ_microplastic</div>
        </div>

        <p className="text-[11px] text-slate-400">
          Where λ₁ (default 1.0) and λ₂ (default 0.5) balance the gradient magnitudes between dense spatial segmentation and sparse multi-class categorization.
        </p>
      </div>

      {/* Model Export & Quantization Trigger */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-ocean-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Edge Deployment: ONNX Export & INT8 Dynamic Quantization
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Export PyTorch graph to ONNX Runtime format and compress weights via 8-bit dynamic quantization.
            </p>
          </div>

          <button
            onClick={handleExportONNX}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-ocean-950 font-bold text-xs shadow-glow-cyan hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting ONNX...' : 'Export ONNX (INT8)'}
          </button>
        </div>

        {exportResult && (
          <div className="p-4 rounded-xl bg-ocean-950 border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="text-emerald-400 font-bold">✓ ONNX Graph Traced & Quantized Successfully!</div>
            <div className="text-slate-300">Original FP32 Size: {exportResult.original_size_mb} MB</div>
            <div className="text-cyan-300">Compressed INT8 Size: {exportResult.quantized_size_mb} MB</div>
            <div className="text-slate-400">Export Location: {exportResult.quantized_path}</div>
          </div>
        )}
      </div>

      {/* Future Research Extensions */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Anchor className="w-4 h-4 text-cyan-400" />
          Prepared Extension Points & Future Scope
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>GPS Geotagging & Heatmapping:</strong> Direct pairing with marine telemetry logs for global debris GIS heatmaps.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>AUV Video Stream Pipeline:</strong> RTSP/GStreamer integration for real-time subsea mission cameras.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>Multispectral & FLIM Fusion:</strong> Fluorescence lifetime imaging microscopy for microplastic polymer identification.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>Federated Marine Learning:</strong> Distributed edge training across autonomous research fleets without transmitting raw video.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
