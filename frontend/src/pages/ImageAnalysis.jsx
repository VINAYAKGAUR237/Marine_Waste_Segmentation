import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, RefreshCw, Download, Eye, Layers, 
  CheckCircle, AlertTriangle, Clock, Zap, Microscope, Trash2 
} from 'lucide-react';
import ImageCompareSlider from '../components/ImageCompareSlider';
import { predictImage, explainImage } from '../services/api';

export default function ImageAnalysis({ isDemoMode }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeView, setActiveView] = useState('slider'); // 'slider', 'grid', 'attention'
  const [enhanceUnderwater, setEnhanceUnderwater] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const loadFile = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const loadSampleImage = async (type = 'debris') => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      // Fetch a sample generated earlier
      const samplePath = type === 'debris' 
        ? '/api/static/data/marine_debris/images/train/debris_0000.jpg'
        : '/api/static/data/microplastics/images/train/micro_0000.jpg';
      
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], `${type}_sample.jpg`, { type: 'image/jpeg' });
      loadFile(file);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load sample image.');
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await predictImage(selectedFile, {
        task: 'all',
        enhance: enhanceUnderwater
      });
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Analysis failed. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!result?.overlay) return;
    const link = document.createElement('a');
    link.href = result.overlay;
    link.download = `marine_segmentation_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Title & Mode Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Multi-Scale Image Analysis Lab
          </h2>
          <p className="text-xs text-slate-400">
            Automated optical restoration, marine debris pixel segmentation & microplastic classification
          </p>
        </div>

        {/* Inference Mode Status Banner */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
          result?.is_demo || isDemoMode
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
          <span>{result?.mode_label || (isDemoMode ? 'DEMO / SAMPLE OUTPUT' : 'ACTUAL TRAINED MODEL')}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Upload / Viewport & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewport (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!previewUrl ? (
            /* Drag and Drop Upload Area */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="h-[420px] rounded-3xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 glass-panel flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 group hover:shadow-glow-cyan"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-ocean-850 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Drop underwater or microscopic imagery here
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Supports JPG, JPEG, PNG, or WEBP up to 25MB. High turbidity underwater or microscope images accepted.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleImage('debris'); }}
                  className="px-3.5 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
                >
                  Load Sample Debris
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadSampleImage('micro'); }}
                  className="px-3.5 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-purple-300 border border-purple-500/30 text-xs font-medium"
                >
                  Load Sample Microplastic
                </button>
              </div>
            </div>
          ) : (
            /* Image Viewport */
            <div className="space-y-3">
              {/* View Switcher Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ocean-900 border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveView('slider')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === 'slider' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Interactive Slider
                  </button>
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === 'grid' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4-Way Grid
                  </button>
                  {result && (
                    <button
                      onClick={() => setActiveView('attention')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeView === 'attention' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Attention Heatmap (XAI)
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {selectedFile?.name || 'sample_image.jpg'}
                </span>
              </div>

              {/* Viewport Display */}
              {activeView === 'slider' && (
                <ImageCompareSlider
                  leftImage={previewUrl}
                  rightImage={result ? result.overlay : previewUrl}
                  leftLabel="Original Underwater"
                  rightLabel={result ? "ViT Predicted Overlay" : "Ready for Analysis"}
                />
              )}

              {activeView === 'grid' && (
                <div className="grid grid-cols-2 gap-3 h-[440px]">
                  <div className="relative rounded-xl overflow-hidden glass-panel border border-slate-800 flex items-center justify-center p-2 bg-ocean-950">
                    <img src={result?.original || previewUrl} alt="Original" className="max-h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ocean-900/80 text-[10px] font-mono text-slate-300 border border-slate-700">
                      1. Original Input
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden glass-panel border border-slate-800 flex items-center justify-center p-2 bg-ocean-950">
                    <img src={result?.preprocessed || previewUrl} alt="Preprocessed" className="max-h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ocean-900/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                      2. CLAHE Enhanced
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden glass-panel border border-slate-800 flex items-center justify-center p-2 bg-ocean-950">
                    {result ? (
                      <img src={result.segmentation_mask} alt="Mask" className="max-h-full object-contain" />
                    ) : (
                      <div className="text-xs text-slate-500 font-mono">Run analysis to generate mask</div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ocean-900/80 text-[10px] font-mono text-pink-300 border border-pink-500/30">
                      3. Segmentation Mask
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden glass-panel border border-slate-800 flex items-center justify-center p-2 bg-ocean-950">
                    {result ? (
                      <img src={result.overlay} alt="Overlay" className="max-h-full object-contain" />
                    ) : (
                      <div className="text-xs text-slate-500 font-mono">Run analysis to generate overlay</div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ocean-900/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                      4. Blended Overlay
                    </span>
                  </div>
                </div>
              )}

              {activeView === 'attention' && result && (
                <div className="h-[440px] rounded-2xl glass-panel p-4 flex flex-col items-center justify-center border border-purple-500/30 bg-ocean-950">
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={result.overlay}
                      alt="Attention Heatmap"
                      className="max-h-[360px] object-contain rounded-xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-mono">
                    Model Attention Visualization (Deep Transformer Cross-Attention Weights)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Controls & Analytics (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Action Control Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
              Inference Controls
            </h3>

            {/* Toggle Underwater CLAHE Enhancement */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-ocean-850 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Underwater Preprocessing</span>
                <span className="text-[11px] text-slate-400">Denoise + Gray-World + CLAHE</span>
              </div>
              <input
                type="checkbox"
                checked={enhanceUnderwater}
                onChange={(e) => setEnhanceUnderwater(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isLoading}
                className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-ocean-950 font-bold text-sm shadow-glow-cyan hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing ViT...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Image
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={!selectedFile || isLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass-card text-xs font-medium text-slate-300 hover:text-white border border-slate-700/60"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                onClick={handleDownload}
                disabled={!result?.overlay}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass-card text-xs font-medium text-cyan-300 hover:text-white border border-cyan-500/30 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                Download Mask
              </button>
            </div>
          </div>

          {/* Results Summary Box */}
          {result && (
            <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  Detection Summary
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-slate-300">
                  {result.processing_time} ms
                </span>
              </div>

              {/* Marine Debris Metrics */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Debris Coverage:</span>
                  <span className="font-mono font-bold text-white">{result.coverage_percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-ocean-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${Math.min(100, result.coverage_percentage * 2)}%` }}
                  />
                </div>
              </div>

              {/* Detected Macro Objects */}
              <div>
                <span className="text-xs text-slate-400 block mb-2">Identified Macro Debris:</span>
                {result.predictions && result.predictions.length > 0 ? (
                  <div className="space-y-1.5">
                    {result.predictions.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-ocean-850/80 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: `rgb(${obj.color_rgb.join(',')})` }}
                          />
                          <span className="font-medium text-white capitalize">{obj.class_name}</span>
                        </div>
                        <span className="font-mono text-cyan-300">{obj.area_percentage}% area</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 rounded-lg bg-ocean-850/40">
                    No macro debris detected above confidence threshold.
                  </div>
                )}
              </div>

              {/* Microplastic Head Findings */}
              {result.microplastic && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1.5">Microplastic Category:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">
                        {result.microplastic.top_class}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-purple-300">
                      {(result.microplastic.confidence * 100).toFixed(1)}% conf
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
