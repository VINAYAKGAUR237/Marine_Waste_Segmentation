import React from 'react';
import { Database, FolderTree, ExternalLink, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DatasetPage() {
  const suggestedSources = [
    {
      name: 'TrashCan 1.0 Dataset',
      desc: 'Underwater imagery containing marine debris instances annotated with polygon segmentation masks.',
      link: 'https://conservancy.umn.edu/handle/11299/214865',
      type: 'Marine Debris'
    },
    {
      name: 'Deep-Trash Debris Dataset',
      desc: 'ROV-captured seafloor and pelagic debris footage collected by marine researchers across global oceans.',
      link: 'https://github.com/mvaldenegro/marine-debris-fls-datasets',
      type: 'Marine Debris'
    },
    {
      name: 'JAMSTEC Deep Sea Debris Database',
      desc: 'Extensive underwater photography of submerged debris down to 10,000 meters depth.',
      link: 'https://www.godac.jamstec.go.jp/umpire/en/',
      type: 'Marine Debris'
    },
    {
      name: 'MP-Microscopy Benchmark',
      desc: 'High-magnification brightfield and fluorescence microscopic images of synthetic fibres, fragments, and microbeads.',
      link: 'https://zenodo.org/record/4646736',
      type: 'Microplastics'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-500/20 bg-gradient-to-r from-ocean-900 to-ocean-850">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-2">
          <Database className="w-4 h-4" />
          <span>DATASET SPECIFICATIONS & INGESTION</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Dataset Architecture & Preparation Pipeline
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Standardized folder hierarchies, annotation formats, and open-access data suggestions for dual-scale macro debris and microplastic microscopy datasets.
        </p>
      </div>

      {/* Directory Hierarchy View */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          Expected Directory Structure (`data/`)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          To train on custom oceanic or microscopic data, organize images and mask pairs into this exact split structure:
        </p>

        <div className="p-4 rounded-xl bg-ocean-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{`data/
├── marine_debris/
│   ├── images/
│   │   ├── train/     # e.g., debris_0001.jpg
│   │   ├── val/
│   │   └── test/
│   └── masks/         # PNG grayscale masks (0=background, 1=bottle, 2=bag, etc.)
│       ├── train/     # e.g., debris_0001.png (must match image filename stem)
│       ├── val/
│       └── test/
│
└── microplastics/
    ├── images/        # High-magnification microscopy images (JPG/PNG)
    │   ├── train/
    │   ├── val/
    │   └── test/
    └── masks/         # Optional particle instance/class masks
        ├── train/
        ├── val/
        └── test/`}</pre>
        </div>
      </div>

      {/* Open-Access Source Suggestions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
          Recommended Open-Access Research Datasets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedSources.map((src, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{src.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    src.type === 'Marine Debris' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {src.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{src.desc}</p>
              </div>

              <a
                href={src.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                <span>Dataset Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Synthetic Demonstration Generator Note */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 flex items-start gap-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-300">
          <span className="font-bold text-white block mb-0.5">Sample Dataset Generator Active</span>
          The system comes equipped with an automated procedural generator (`ml/datasets/dataset.py:create_sample_dataset()`) that synthesizes 32 demonstration marine scenes and microscopic particle masks for immediate out-of-the-box local training and testing.
        </div>
      </div>
    </div>
  );
}
