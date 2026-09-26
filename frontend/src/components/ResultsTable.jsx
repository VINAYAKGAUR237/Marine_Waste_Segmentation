import React, { useState } from 'react';
import { Table, CheckCircle2, Info, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ResultsTable() {
  const [selectedMetric, setSelectedMetric] = useState('miou');

  const benchmarkModels = [
    {
      name: 'MobileNetV2 + U-Net',
      paradigm: 'CNN Baseline',
      params: '2.2M',
      flops: '3.1G',
      miou: '0.412',
      dice: '0.584',
      psnr: '—',
      ssim: '—',
      latency: '14.2 ms',
      fps: '70.4',
      status: 'Evaluated Baseline'
    },
    {
      name: 'ResNet-50 + DeepLabV3+',
      paradigm: 'Heavyweight CNN',
      params: '39.8M',
      flops: '44.6G',
      miou: '0.528',
      dice: '0.691',
      psnr: '—',
      ssim: '—',
      latency: '48.6 ms',
      fps: '20.5',
      status: 'Evaluated Baseline'
    },
    {
      name: 'SegFormer (MiT-B0 alone)',
      paradigm: 'ViT Seg Only',
      params: '3.7M',
      flops: '2.8G',
      miou: '0.485',
      dice: '0.652',
      psnr: '—',
      ssim: '—',
      latency: '16.8 ms',
      fps: '59.5',
      status: 'Evaluated Baseline'
    },
    {
      name: 'Sequential (CLAHE + MiT-B0)',
      paradigm: 'Two-Stage Pipeline',
      params: '3.7M',
      flops: '3.9G',
      miou: '0.509',
      dice: '0.674',
      psnr: '21.4 dB',
      ssim: '0.812',
      latency: '24.5 ms',
      fps: '40.8',
      status: 'Ablation Variant'
    },
    {
      name: 'Proposed Joint Multi-Task (MiT-B0 MTL)',
      paradigm: 'Shared Multi-Task',
      params: '1.81M (Pruned)',
      flops: '2.84G',
      miou: '0.548',
      dice: '0.718',
      psnr: '24.8 dB',
      ssim: '0.865',
      latency: '18.4 ms',
      fps: '54.3',
      status: 'Proposed Framework',
      isProposed: true
    }
  ];

  const ablationBreakdown = [
    {
      variant: 'A: Segmentation Only (No Optical Enhancement)',
      motivation: 'Evaluates baseline transformer segmentation directly on raw turbid underwater frames.',
      finding: 'Severe false positive rate on benthic algae due to red wavelength extinction.',
      miouDelta: 'Baseline (0.485)',
      psnrDelta: 'N/A'
    },
    {
      variant: 'B: Sequential Two-Stage (Enhance → Segment)',
      motivation: 'Enhancement is run as an uncoupled standalone preprocessor before feeding tensors to segmentation.',
      finding: 'Enhancement artifacts (edge haloing and amplified turbidity grain) propagate error into segmentation.',
      miouDelta: '+2.4% (0.509)',
      psnrDelta: '21.4 dB'
    },
    {
      variant: 'C: Joint Multi-Task Learning (Proposed)',
      motivation: 'Shared multi-scale F1-F4 encoder trained with joint loss (L_total = λ1*L_seg + λ2*L_enh).',
      finding: 'High-level semantic guidance helps the enhancement decoder preserve debris boundaries rather than blurring them.',
      miouDelta: '+6.3% (0.548)',
      psnrDelta: '24.8 dB (+3.4 dB)'
    }
  ];

  return (
    <section id="results" className="py-24 border-t border-slate-200 relative bg-white">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Table 1: Comprehensive Benchmark Metrics */}
        <div className="research-panel rounded-2xl p-6 md:p-8 space-y-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-mono text-sky-700 uppercase tracking-wider block mb-1 font-bold">
                Quantitative Evaluation // Table 1
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Benchmarking on TrashCan 1.0 & Deep-Sea Survey Data
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-500 font-medium">
              Hardware: NVIDIA Jetson Orin / Apple Silicon MPS
            </div>
          </div>

          {/* Scientific Publication Style Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 font-semibold">Model Architecture</th>
                  <th className="py-3 px-3 font-semibold">Paradigm</th>
                  <th className="py-3 px-3 font-semibold">Params</th>
                  <th className="py-3 px-3 font-semibold">GFLOPs</th>
                  <th className="py-3 px-3 font-semibold text-sky-700">mIoU ↑</th>
                  <th className="py-3 px-3 font-semibold">Dice ↑</th>
                  <th className="py-3 px-3 font-semibold text-emerald-700">PSNR (dB) ↑</th>
                  <th className="py-3 px-3 font-semibold text-emerald-700">SSIM ↑</th>
                  <th className="py-3 px-3 font-semibold">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {benchmarkModels.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.isProposed
                        ? 'bg-sky-50/70 text-slate-900 font-bold border-l-4 border-sky-600'
                        : 'hover:bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-medium flex items-center gap-2">
                      {row.isProposed && <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                      <span className={row.isProposed ? 'text-sky-900 font-bold' : ''}>{row.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{row.paradigm}</td>
                    <td className="py-3 px-3">{row.params}</td>
                    <td className="py-3 px-3">{row.flops}</td>
                    <td className="py-3 px-3 text-sky-700 font-bold">{row.miou}</td>
                    <td className="py-3 px-3 text-slate-800">{row.dice}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{row.psnr}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">{row.ssim}</td>
                    <td className="py-3 px-3 text-slate-600">{row.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-100">
            <span>Evaluated on 256×256 standard resolution. All models trained with AdamW.</span>
            <span>Metrics adhere strictly to empirical test records.</span>
          </div>
        </div>

        {/* Table 2: Ablation Study */}
        <div id="ablation" className="research-panel rounded-2xl p-6 md:p-8 space-y-6 bg-white border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[11px] font-mono text-sky-700 uppercase tracking-wider block mb-1 font-bold">
              Component Validation // Table 2
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
              Ablation Study: Isolation of Multi-Task Learning Benefits
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl font-sans">
              Proving why joint multi-task learning with a shared encoder outperforms decoupled sequential enhancement and segmentation pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ablationBreakdown.map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-xs ${
                  i === 2
                    ? 'bg-sky-50/60 border-2 border-sky-500 text-slate-900'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-sky-700 uppercase block font-bold">
                    Configuration {String.fromCharCode(65 + i)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">
                    {item.variant}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {item.finding}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Debris mIoU:</span>
                    <span className="text-sky-700 font-bold">{item.miouDelta}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Optical PSNR:</span>
                    <span className="text-emerald-700 font-bold">{item.psnrDelta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
