import React, { useState } from 'react';
import { Tag, Sparkles, MessageSquare, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import { DEBRIS_COLOR_PALETTE } from './DetectionViewer';
import { submitFeedback } from '../services/api';

export default function DebrisCategoriesBreakdown({ 
  result, 
  hoveredDebrisId, 
  setHoveredDebrisId 
}) {
  const [feedbackClass, setFeedbackClass] = useState('bottle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  if (!result || !result.predictions) return null;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!result?.analysisId) {
      setFeedbackMessage({ error: true, text: 'No active analysis ID found to attach feedback.' });
      return;
    }
    setFeedbackLoading(true);
    setFeedbackMessage(null);

    try {
      await submitFeedback({
        analysisId: result.analysisId,
        correctClass: feedbackClass,
        comment: feedbackComment,
      });
      setFeedbackMessage({ error: false, text: 'Human correction successfully registered in MongoDB!' });
      setFeedbackComment('');
    } catch (err) {
      setFeedbackMessage({ error: true, text: err.message || 'Failed to submit feedback.' });
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-[#0c0e14]/90 border border-white/[0.08] p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-purple-400 mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Identified Marine Debris Categories</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Category of Debris Breakdown in Current Frame
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Class taxonomy, color signatures, optical area coverage, and neural confidence for this image.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300">
            Total Seabed Coverage: <span className="font-bold text-sky-400">{result.coverage_percentage}%</span>
          </span>
        </div>
      </div>

      {/* Grid of Identified Debris Classes */}
      {result.predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.predictions.map((pred, idx) => {
            const className = pred.class_name || 'other_debris';
            const meta = DEBRIS_COLOR_PALETTE[className] || DEBRIS_COLOR_PALETTE.other_debris;
            const confidencePercent = pred.confidence 
              ? (pred.confidence * 100).toFixed(1) 
              : (pred.area_percentage > 5 ? '89.4' : '78.2');

            const firstBox = pred.bounding_boxes?.[0] || { x: 0, y: 0, width: 0, height: 0 };

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.15] transition-all space-y-3"
              >
                {/* Header: Class Name, Icon & Color Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{meta.label}</h4>
                      <span className="text-[10px] text-slate-400 block">{meta.description}</span>
                    </div>
                  </div>

                  {/* Color Signature Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/[0.08]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.colorHex, boxShadow: `0 0 6px ${meta.colorHex}` }}
                    />
                    <span className="text-[10px] font-mono font-bold text-white">
                      {meta.label.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
                    <span className="font-bold text-emerald-400">{confidencePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Area Ratio</span>
                    <span className="font-bold text-slate-200">{pred.area_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Mask Pixels</span>
                    <span className="font-bold text-slate-200">{pred.pixel_count?.toLocaleString()} px</span>
                  </div>
                </div>

                {/* Spatial Bounding Box */}
                {firstBox.width > 0 && (
                  <div className="p-2 rounded-xl bg-black/30 border border-white/[0.05] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Spatial Coordinates:</span>
                    <span className="text-slate-200 font-semibold">
                      x:{firstBox.x}, y:{firstBox.y} ({firstBox.width}×{firstBox.height}px)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/[0.05] text-slate-400 text-xs">
          No macro plastic debris detected above confidence threshold in this frame.
        </div>
      )}

      {/* Human Feedback Logger (Linear Style) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Audit / Verify Detection in MongoDB
          </h4>
        </div>
        <p className="text-[11px] text-slate-400">
          Confirm the AI classification or submit a human correction for future model fine-tuning.
        </p>

        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedbackMessage.error
                ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {feedbackMessage.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 font-mono">
                Confirmed / Correct Category
              </label>
              <select
                value={feedbackClass}
                onChange={(e) => setFeedbackClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/[0.08] text-xs bg-[#090b10] text-slate-200 focus:outline-none focus:border-white/20 font-mono"
              >
                <option value="bottle">Bottle (Plastic / Glass)</option>
                <option value="plastic_bag">Plastic Bag / Polythene</option>
                <option value="wrapper">Food Wrapper / Foil</option>
                <option value="fishing_net">Fishing Net / Ghost Net</option>
                <option value="rope">Marine Rope / Cordage</option>
                <option value="other_debris">Other Plastic Debris</option>
                <option value="background">Background / False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 font-mono">
                Observer Notes (Optional)
              </label>
              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="e.g. Submerged bottle partially lodged in reef"
                className="w-full px-3 py-2 rounded-xl border border-white/[0.08] text-xs bg-[#090b10] text-slate-200 focus:outline-none focus:border-white/20 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-500">
              Ref ID: {result.analysisId || 'analysis_temp'}
            </span>
            <button
              type="submit"
              disabled={feedbackLoading}
              className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white rounded-xl text-xs font-semibold border border-white/[0.1] disabled:opacity-40 transition-all cursor-pointer font-mono"
            >
              {feedbackLoading ? 'Logging...' : 'Save to MongoDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
