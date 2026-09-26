import React, { useState, useRef } from 'react';
import { Sliders, RefreshCw, Sparkles, Upload, ArrowRight, Eye, Check } from 'lucide-react';
import { preprocessImage } from '../services/api';
import ImageCompareSlider from '../components/ImageCompareSlider';

export default function PreprocessingPlayground() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [clipLimit, setClipLimit] = useState(2.5);
  const [denoiseStrength, setDenoiseStrength] = useState(10.0);
  const [redGain, setRedGain] = useState(1.25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const loadSample = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/static/data/marine_debris/images/train/debris_0000.jpg');
      const blob = await res.blob();
      const file = new File([blob], 'underwater_turbid.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      runEnhancement(file, clipLimit, denoiseStrength, redGain);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      runEnhancement(file, clipLimit, denoiseStrength, redGain);
    }
  };

  const runEnhancement = async (file, clip, denoise, red) => {
    setIsProcessing(true);
    try {
      const data = await preprocessImage(file, {
        clipLimit: clip,
        denoiseStrength: denoise,
        redGain: red
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (selectedFile) {
      runEnhancement(selectedFile, clipLimit, denoiseStrength, redGain);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-500/20 bg-gradient-to-r from-ocean-900 via-ocean-850 to-cyan-950/40">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-2">
          <Sliders className="w-4 h-4" />
          <span>PHYSICAL & OPTICAL ENHANCEMENT LAB</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Underwater Image Preprocessing & CLAHE Lab
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Interact with the 6-stage physical compensation pipeline: Bilateral Denoising, Gray-World White Balance, Red-channel attenuation compensation, and CIELAB Contrast Limited Adaptive Histogram Equalization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Viewport (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-[420px] rounded-3xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 glass-panel flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all hover:shadow-glow-cyan"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <div className="w-14 h-14 rounded-2xl bg-ocean-850 border border-cyan-500/30 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Upload raw underwater image</h3>
              <p className="text-xs text-slate-400 mb-4">Observe chromatic restoration in real-time</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); loadSample(); }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30"
              >
                Load Turbid Sample Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageCompareSlider
                leftImage={result?.images?.before || previewUrl}
                rightImage={result?.images?.after || previewUrl}
                leftLabel="Raw Turbid Input"
                rightLabel="Restored & CLAHE Enhanced"
              />

              {/* Before vs After Color & Luminance Metrics */}
              {result?.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono block">Contrast (Std Dev)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-white font-mono">
                        {result.metrics.after.contrast_std.toFixed(1)}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">
                        +{result.metrics.contrast_improvement}
                      </span>
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono block">Red:Blue Ratio</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-white font-mono">
                        {result.metrics.after.red_to_blue_ratio.toFixed(2)}
                      </span>
                      <span className="text-xs text-cyan-400 font-mono">
                        +{result.metrics.red_recovery}
                      </span>
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono block">Mean Luminance</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-white font-mono">
                        {result.metrics.after.mean_luminance.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        (was {result.metrics.before.mean_luminance.toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono block">Status</span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-semibold font-mono">
                      <Check className="w-4 h-4" />
                      <span>Ready for ViT</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Sliders (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                Optical Parameters
              </h3>
              <button
                onClick={loadSample}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Sample Image
              </button>
            </div>

            {/* Slider 1: CLAHE Clip Limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">CLAHE Clip Limit</span>
                <span className="font-mono text-cyan-300 font-bold">{clipLimit}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={clipLimit}
                onChange={(e) => setClipLimit(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-ocean-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400">Controls maximum contrast amplification threshold in LAB space.</p>
            </div>

            {/* Slider 2: Denoising Strength */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Bilateral Denoise Strength</span>
                <span className="font-mono text-cyan-300 font-bold">{denoiseStrength}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="25.0"
                step="1.0"
                value={denoiseStrength}
                onChange={(e) => setDenoiseStrength(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-ocean-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400">Eliminates marine snow particulate while preserving object edges.</p>
            </div>

            {/* Slider 3: Red Attenuation Gain */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Red Absorption Compensation</span>
                <span className="font-mono text-cyan-300 font-bold">{redGain}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={redGain}
                onChange={(e) => setRedGain(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-ocean-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[10px] text-slate-400">Compensates exponential underwater long-wavelength attenuation.</p>
            </div>

            {/* Update / Apply Button */}
            <button
              onClick={handleApply}
              disabled={!selectedFile || isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-ocean-950 font-bold text-sm shadow-glow-cyan hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Applying Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enhance Underwater Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
