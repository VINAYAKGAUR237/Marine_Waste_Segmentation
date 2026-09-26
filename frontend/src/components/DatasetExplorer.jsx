import React, { useState } from 'react';
import { Database, FolderGit2, Layers, HardDrive, Filter, ExternalLink, ShieldCheck } from 'lucide-react';

export default function DatasetExplorer() {
  const [selectedDataset, setSelectedDataset] = useState('trashcan'); // 'trashcan', 'deepsea', 'microplastics'

  const datasets = {
    trashcan: {
      name: 'TrashCan 1.0 Underwater Dataset',
      subtitle: 'Instance & Semantic Segmentation for Subsea Marine Debris',
      source: 'University of Minnesota / Marine Robotics Lab',
      samples: '7,212 Annotated Images',
      instances: '9,400+ Instance Polygons',
      depthRange: '5m – 120m (Coastal & Mesophotic Shelf)',
      splits: { train: '5,770 (80%)', val: '721 (10%)', test: '721 (10%)' },
      license: 'Creative Commons BY-NC-SA 4.0',
      description: 'TrashCan 1.0 is a curated benchmark for underwater waste detection. It captures natural submersed imagery across varying water turbidity, optical color casts, and illumination conditions, distinguishing actual anthropogenic debris from marine organisms and ROV robotic hardware.',
      classes: [
        { name: 'Bottles (PET / Glass)', count: '1,420', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { name: 'Plastic Bags / Films', count: '1,180', color: 'bg-sky-50 text-sky-800 border-sky-200' },
        { name: 'Wrappers & Food Packaging', count: '940', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { name: 'Fishing Nets & Trawls', count: '760', color: 'bg-rose-50 text-rose-800 border-rose-200' },
        { name: 'Ropes & Monofilament Line', count: '690', color: 'bg-purple-50 text-purple-800 border-purple-200' },
        { name: 'Metal Cans & Debris', count: '540', color: 'bg-slate-100 text-slate-800 border-slate-300' },
        { name: 'Biological Flora/Fauna', count: '2,100', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
        { name: 'ROV Manipulator / Umbilical', count: '1,770', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      ],
      sampleImages: [
        { path: '/api/static/data/marine_debris/images/train/debris_0000.jpg', caption: 'Shallow coastal debris: PET bottle on silt substrate' },
        { path: '/api/static/data/marine_debris/images/train/debris_0001.jpg', caption: 'Midwater pelagic drift: Entangled plastic film' },
        { path: '/api/static/data/marine_debris/images/train/debris_0002.jpg', caption: 'Benthic reef boundary: Discarded fishing line' },
      ]
    },
    deepsea: {
      name: 'JAMSTEC J-EDI Deep-Sea Debris Archive',
      subtitle: 'Abyssal & Benthic Waste in Hydrothermal and Trench Basins',
      source: 'Japan Agency for Marine-Earth Science and Technology (JAMSTEC)',
      samples: '5,000+ Deep Submersible Video Records',
      instances: '3,200+ Georeferenced Debris Encounters',
      depthRange: '500m – 6,500m (Bathyal to Hadal Trenches)',
      splits: { train: '3,500 (70%)', val: '750 (15%)', test: '750 (15%)' },
      license: 'Public Scientific Archive (JAMSTEC)',
      description: 'Records captured over 30 years by human-occupied submersibles (Shinkai 6500) and ROVs (Hyper-Dolphin, Kaiko). Features extreme deep-sea conditions: complete absence of solar light, high backscatter from artificial halogens, and centuries-persistent non-biodegradable synthetic polymers.',
      classes: [
        { name: 'Deep Plastic Packaging', count: '1,650', color: 'bg-sky-50 text-sky-800 border-sky-200' },
        { name: 'Derelict Fishing Gear (Ghost Nets)', count: '890', color: 'bg-rose-50 text-rose-800 border-rose-200' },
        { name: 'Metal Drums & Cans', count: '410', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { name: 'Rubber / Industrial Components', count: '250', color: 'bg-purple-50 text-purple-800 border-purple-200' },
      ],
      sampleImages: [
        { path: '/api/static/data/marine_debris/images/train/debris_0003.jpg', caption: '1,450m Sagami Bay: Deeply buried synthetic polymer' },
        { path: '/api/static/data/marine_debris/images/train/debris_0004.jpg', caption: '3,200m Mariana Trench Slope: Entangled ghost netting' },
        { path: '/api/static/data/marine_debris/images/train/debris_0005.jpg', caption: '2,100m Ryukyu Trench: Artificial container encrusted by serpulids' },
      ]
    },
    microplastics: {
      name: 'Microplastic Morphological Classification Benchmark',
      subtitle: 'High-Magnification Optical & Fluorescence Micro-Polymer Identification',
      source: 'Environmental Water Sample Survey Protocol',
      samples: '2,400 Microscopic Field Images',
      instances: '8,500 Identified Particles (<5mm)',
      depthRange: 'Surface Sieve to 100m Manta Trawls',
      splits: { train: '1,920 (80%)', val: '240 (10%)', test: '240 (10%)' },
      license: 'Academic Open Access',
      description: 'High-resolution microscopic dataset classifying sub-5mm secondary and primary microplastic polymers collected via marine Neuston and Manta nets. Targets 5 standardized morphological categories under white light and blue excitation fluorescence.',
      classes: [
        { name: 'Fibre (Textile Shedding)', count: '3,840', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
        { name: 'Fragment (Hard Plastic Breakdown)', count: '2,450', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { name: 'Film (Bag & Wrap Degradation)', count: '1,120', color: 'bg-sky-50 text-sky-800 border-sky-200' },
        { name: 'Foam (Expanded Polystyrene)', count: '640', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { name: 'Sphere / Pellet (Virgin Pre-production)', count: '450', color: 'bg-purple-50 text-purple-800 border-purple-200' },
      ],
      sampleImages: [
        { path: '/api/static/data/microplastics/images/train/micro_0000.jpg', caption: 'Microscopic 40x field: Synthetic polypropylene fibres' },
        { path: '/api/static/data/microplastics/images/train/micro_0001.jpg', caption: 'Fluorescence excitation: Weathered polyethylene fragment' },
        { path: '/api/static/data/microplastics/images/train/micro_0002.jpg', caption: 'Reflected light: Secondary film particle with jagged edges' },
      ]
    }
  };

  const current = datasets[selectedDataset];

  return (
    <section id="datasets" className="py-24 border-t border-slate-200 relative bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px] uppercase tracking-wider mb-4 font-semibold shadow-xs">
            06. Benchmark Datasets
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans mb-4">
            Marine Pollution & Deep-Sea Datasets
          </h2>
          <p className="text-base text-slate-600 font-sans leading-relaxed">
            Rigorous empirical evaluation requires testing across both real coastal AUV imagery (TrashCan 1.0), 
            abyssal deep-submersible archives (JAMSTEC J-EDI), and laboratory micro-polymer captures.
          </p>
        </div>

        {/* Dataset Selection Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedDataset('trashcan')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              selectedDataset === 'trashcan'
                ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 font-bold shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            TrashCan 1.0 (Coastal AUV)
          </button>

          <button
            onClick={() => setSelectedDataset('deepsea')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              selectedDataset === 'deepsea'
                ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 font-bold shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-sky-600" />
            JAMSTEC J-EDI (Abyssal Debris)
          </button>

          <button
            onClick={() => setSelectedDataset('microplastics')}
            className={`px-4 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
              selectedDataset === 'microplastics'
                ? 'bg-sky-50 border-2 border-sky-600 text-slate-900 font-bold shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            Microplastics Benchmark
          </button>
        </div>

        {/* Selected Dataset Details Card */}
        <div className="research-panel rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                  {current.name}
                </h3>
              </div>
              <p className="text-xs font-mono text-sky-700 font-semibold mb-4">
                {current.subtitle} • Source: {current.source}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-sans mb-6">
                {current.description}
              </p>

              {/* Class Distribution Breakdown */}
              <div className="mb-4">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3 font-semibold">
                  Documented Target Classes & Instance Counts:
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${cls.color}`}
                    >
                      <span className="font-semibold">{cls.name}</span>
                      <span className="opacity-80 text-[10px]">({cls.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dataset Technical Specs */}
            <div className="lg:col-span-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs shadow-xs">
              <div className="text-[11px] text-slate-500 uppercase pb-2 border-b border-slate-200 font-bold">
                Technical Specifications
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Total Scale:</span>
                <span className="text-slate-900 font-bold">{current.samples}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Total Instances:</span>
                <span className="text-slate-900 font-bold">{current.instances}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Operating Depth:</span>
                <span className="text-sky-700 font-bold">{current.depthRange}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-medium">Train / Val / Test Split:</span>
                <span className="text-slate-700 font-medium">
                  {current.splits.train} | {current.splits.val} | {current.splits.test}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block text-[10px] font-medium">Licensing:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {current.license}
                </span>
              </div>
            </div>
          </div>

          {/* Sample Previews Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4 font-semibold">
              Representative Dataset Samples:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {current.sampleImages.map((s, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group shadow-xs">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={s.path}
                      alt={s.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 border border-white/20 text-[9px] font-mono text-white">
                      Sample #{idx + 1}
                    </div>
                  </div>
                  <div className="p-3 text-[11px] font-mono text-slate-600 font-medium">
                    {s.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
