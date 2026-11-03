import React, { useState, useEffect } from 'react';
import GlowingUploadLogo from '../components/GlowingUploadLogo';
import EnhancementNode from '../components/EnhancementNode';
import SegmentationNode from '../components/SegmentationNode';
import GlowingArrowCursor from '../components/GlowingArrowCursor';
import { predictImage } from '../services/api';
import { RefreshCw, Sparkles, Upload, Sliders, Layers } from 'lucide-react';

export default function ImageAnalysis({ onNavigateToLogin, onNavigateToHistory, modelInfo, onResultChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Necklace Node Index: 0 = Upload, 1 = Enhancement, 2 = Segmentation
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  // Bead expansion states (initially false so both Enhancement and Segmentation show the glowing box first)
  const [isEnhanceExpanded, setIsEnhanceExpanded] = useState(false);
  const [isSegExpanded, setIsSegExpanded] = useState(false);

  // Notify parent component whether an active result exists
  useEffect(() => {
    if (onResultChange) {
      onResultChange(Boolean(result));
    }
  }, [result, onResultChange]);

  /**
   * Converts any web image (AVIF, WebP, SVG, BMP, etc.) into standard JPEG format
   * using browser canvas if needed, ensuring 100% decoder compatibility.
   */
  const normalizeWebImage = async (file) => {
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      return file;
    }
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 512;
          canvas.height = img.naturalHeight || 512;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              const cleanName = (file.name || 'image').replace(/\.[^/.]+$/, '') + '.jpg';
              resolve(new File([blob], cleanName, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.95);
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  /**
   * Main file processor: runs model and triggers smooth slide to Enhancement node
   */
  const handleProcessFile = async (rawFile) => {
    if (!rawFile) return;

    const isImage = rawFile.type?.startsWith('image/') || 
      rawFile.name?.match(/\.(jpe?g|png|webp|avif|jfif|bmp|tiff?|gif|svg)$/i) ||
      (typeof rawFile === 'string' && (rawFile.startsWith('http') || rawFile.startsWith('data:image')));

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      let localUrl = null;
      let fileToSend = rawFile;

      if (typeof rawFile === 'string') {
        localUrl = rawFile;
        setSelectedFile({ name: rawFile.split('/').pop()?.split('?')[0] || 'web_image.jpg' });
      } else {
        localUrl = URL.createObjectURL(rawFile);
        setSelectedFile(rawFile);
        fileToSend = await normalizeWebImage(rawFile);
      }

      setPreviewUrl(localUrl);

      // Run prediction through Express -> FastAPI pipeline
      const data = await predictImage(fileToSend, { enhance: false });
      setResult(data);

      if (data.original) {
        setPreviewUrl(data.original);
      }

      // Smooth horizontal shift to the next necklace bead: Enhancement!
      setTimeout(() => {
        setCurrentNodeIndex(1);
      }, 150);

    } catch (err) {
      setErrorMsg(err.message || 'Image detection failed. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Global clipboard paste listener (⌘V / Ctrl+V)
   */
  useEffect(() => {
    const handlePaste = async (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleProcessFile(file);
            return;
          }
        }
      }

      if (activeTag !== 'input' && activeTag !== 'textarea') {
        const text = e.clipboardData.getData('text')?.trim();
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          e.preventDefault();
          await handleProcessFile(text);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    setCurrentNodeIndex(0);
    setIsEnhanceExpanded(false);
    setIsSegExpanded(true);
    if (onResultChange) onResultChange(false);
  };

  const handleNextNode = () => {
    if (currentNodeIndex < 2 && result) {
      setCurrentNodeIndex((prev) => prev + 1);
    }
  };

  const handlePrevNode = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden overflow-y-auto bg-[#08090a]">
      {/* =========================================================================
          SUBTLE NECKLACE PROGRESS BEADS AT TOP (Minimalist & Non-Intrusive)
         ========================================================================= */}
      {result && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/[0.08] backdrop-blur-xl shadow-lg">
          {/* Bead 0: Upload */}
          <button
            onClick={() => setCurrentNodeIndex(0)}
            className={`flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
              currentNodeIndex === 0 ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentNodeIndex === 0 ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-slate-600'}`} />
            <span>Upload</span>
          </button>

          <span className="w-6 h-[1px] bg-white/20 border-b border-dashed" />

          {/* Bead 1: Enhancement */}
          <button
            onClick={() => setCurrentNodeIndex(1)}
            className={`flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
              currentNodeIndex === 1 ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentNodeIndex === 1 ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-600'}`} />
            <span>Enhancement</span>
          </button>

          <span className="w-6 h-[1px] bg-white/20 border-b border-dashed" />

          {/* Bead 2: Segmentation */}
          <button
            onClick={() => setCurrentNodeIndex(2)}
            className={`flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
              currentNodeIndex === 2 ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentNodeIndex === 2 ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-slate-600'}`} />
            <span>Segmentation</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE GLOWING WHITE ARROW CURSOR (Navigates beads when cursor touches edges)
         ========================================================================= */}
      {result && (
        <GlowingArrowCursor
          hasNext={currentNodeIndex < 2}
          hasPrev={currentNodeIndex > 0}
          onNext={handleNextNode}
          onPrev={handlePrevNode}
        />
      )}

      {/* =========================================================================
          THE HORIZONTAL NECKLACE PIPELINE TRACK (Smooth sliding camera animation)
         ========================================================================= */}
      <div 
        className="flex w-[300vw] min-h-screen transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `translateX(-${currentNodeIndex * 100}vw)`,
        }}
      >
        {/* =======================================================================
            BEAD 0: UPLOAD IMAGE NODE
           ======================================================================= */}
        <div className="w-[100vw] min-h-screen shrink-0 flex items-center justify-center relative">
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-[#08090a]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-1">
                Analyzing Marine Debris...
              </h2>
            </div>
          )}

          <GlowingUploadLogo
            onFileSelect={handleProcessFile}
            isLoading={isLoading}
            errorMsg={errorMsg}
          />
        </div>

        {/* =======================================================================
            BEAD 1: ENHANCEMENT NODE (Optical Preprocessing & CLAHE)
           ======================================================================= */}
        <div className="w-[100vw] min-h-screen shrink-0 flex items-center justify-center relative">
          <EnhancementNode
            result={result}
            previewUrl={previewUrl}
            isExpanded={isEnhanceExpanded}
            onToggleExpand={() => setIsEnhanceExpanded((prev) => !prev)}
          />
        </div>

        {/* =======================================================================
            BEAD 2: SEGMENTATION NODE (Color Bounding Boxes over Each Debris)
           ======================================================================= */}
        <div className="w-[100vw] min-h-screen shrink-0 flex items-center justify-center relative">
          <SegmentationNode
            result={result}
            previewUrl={previewUrl}
            selectedFileName={selectedFile?.name}
            onReset={handleReset}
            modelInfo={modelInfo}
            isExpanded={isSegExpanded}
            onToggleExpand={() => setIsSegExpanded((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  );
}
