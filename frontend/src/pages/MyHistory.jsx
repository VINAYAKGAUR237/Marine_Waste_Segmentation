import React, { useState, useEffect } from 'react';
import { History, Clock, FileText, CheckCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { fetchHistory, isAuthenticated, submitFeedback } from '../services/api';

export default function MyHistory({ onNavigateToLogin, onNavigateToAnalysis }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Feedback form state
  const [feedbackClass, setFeedbackClass] = useState('bottle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const loadHistory = async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchHistory();
      setHistoryList(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load analysis history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnalysis) return;
    setFeedbackSubmitting(true);
    setFeedbackStatus(null);
    try {
      await submitFeedback({
        analysisId: selectedAnalysis._id || selectedAnalysis.id,
        correctClass: feedbackClass,
        comment: feedbackComment,
      });
      setFeedbackStatus({ success: true, message: 'Feedback saved to database!' });
      setFeedbackComment('');
      setTimeout(() => setSelectedAnalysis(null), 1500);
    } catch (err) {
      setFeedbackStatus({ success: false, message: err.message || 'Error submitting feedback.' });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#0c0e14]/90 border border-white/[0.08] rounded-3xl text-center shadow-xl backdrop-blur-xl">
        <History className="w-10 h-10 text-sky-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Please log in to your account to view your past marine debris analyses and audit history.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="px-5 py-2.5 bg-white/[0.1] hover:bg-white/[0.18] text-white font-semibold rounded-xl text-xs border border-white/[0.1] transition-all cursor-pointer font-mono"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            My Analysis History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged inference records, detected debris classes, and coverage metrics from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onNavigateToAnalysis}
            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-[#0c0e14]/90 rounded-3xl border border-white/[0.08]">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading your history records...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && historyList.length === 0 && (
        <div className="p-12 text-center bg-[#0c0e14]/90 rounded-3xl border border-white/[0.08]">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Past Analyses Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            You haven't run any image predictions yet. Upload an underwater image to see results logged here.
          </p>
          <button
            onClick={onNavigateToAnalysis}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            Analyze First Image
          </button>
        </div>
      )}

      {/* History table */}
      {!isLoading && historyList.length > 0 && (
        <div className="bg-[#0c0e14]/90 rounded-3xl border border-white/[0.08] overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-semibold font-mono">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Detected Debris Classes</th>
                  <th className="py-3 px-4">Coverage %</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {historyList.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[180px] truncate font-mono">
                      {item.fileName}
                    </td>
                    <td className="py-3 px-4">
                      {item.detectedClasses && item.detectedClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.detectedClasses.map((cls, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white/[0.05] text-sky-300 border border-white/[0.08] text-[11px] font-medium capitalize"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None (Background)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {Number(item.coveragePercent).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.processingTimeMs ? `${Number(item.processingTimeMs).toFixed(1)} ms` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAnalysis(item);
                          setFeedbackStatus(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white font-medium text-[11px] cursor-pointer inline-flex items-center gap-1 border border-white/[0.08]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Modal / Overlay */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c0e14] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/[0.1]">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Submit Analysis Correction
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              File: <span className="font-semibold text-slate-200">{selectedAnalysis.fileName}</span> (ID: {selectedAnalysis._id})
            </p>

            {feedbackStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackStatus.success
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-950/40 text-red-300 border border-red-500/30'
                }`}
              >
                {feedbackStatus.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedbackStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  Correct Debris Class
                </label>
                <select
                  value={feedbackClass}
                  onChange={(e) => setFeedbackClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] text-xs bg-[#090b10] text-slate-200 focus:outline-none focus:border-white/20 font-mono"
                >
                  <option value="bottle">Bottle (Plastic / Glass)</option>
                  <option value="plastic_bag">Plastic Bag</option>
                  <option value="wrapper">Wrapper / Foil</option>
                  <option value="fishing_net">Fishing Net</option>
                  <option value="rope">Rope / Line</option>
                  <option value="other_debris">Other Debris</option>
                  <option value="background">None / Background False Positive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  Correction Comment
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g., Partially buried plastic bottle misclassified as wrapper."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] text-xs bg-[#090b10] text-slate-200 focus:outline-none focus:border-white/20 font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {feedbackSubmitting ? 'Saving...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
