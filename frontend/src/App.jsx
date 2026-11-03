import React, { useState, useEffect } from 'react';
import LinearNavbar from './components/LinearNavbar';
import ImageAnalysis from './pages/ImageAnalysis';
import ModelPerformance from './pages/ModelPerformance';
import MyHistory from './pages/MyHistory';
import AboutProject from './pages/AboutProject';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { fetchHealth, fetchModelInfo, getUser, clearAuth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [hasActiveResult, setHasActiveResult] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check local auth
    const storedUser = getUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    // Health and model info from Express backend
    fetchHealth()
      .then((data) => setSystemStatus(data))
      .catch((err) => console.warn('Backend status error:', err));

    fetchModelInfo()
      .then((data) => setModelInfo(data))
      .catch((err) => console.warn('Model info error:', err));
  }, []);

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    setActiveTab('login');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('analysis');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <ImageAnalysis
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToHistory={() => setActiveTab('history')}
            modelInfo={modelInfo}
            onResultChange={setHasActiveResult}
          />
        );
      case 'performance':
        return <ModelPerformance modelInfo={modelInfo} />;
      case 'history':
        return (
          <MyHistory
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToAnalysis={() => setActiveTab('analysis')}
          />
        );
      case 'about':
        return <AboutProject />;
      case 'dashboard':
        return <Dashboard modelInfo={modelInfo} onNavigate={setActiveTab} />;
      case 'login':
        return (
          <Login
            onAuthSuccess={handleAuthSuccess}
            onNavigateToSignup={() => setActiveTab('signup')}
          />
        );
      case 'signup':
        return (
          <Signup
            onAuthSuccess={handleAuthSuccess}
            onNavigateToLogin={() => setActiveTab('login')}
          />
        );
      default:
        return (
          <ImageAnalysis
            onNavigateToLogin={() => setActiveTab('login')}
            onNavigateToHistory={() => setActiveTab('history')}
            modelInfo={modelInfo}
            onResultChange={setHasActiveResult}
          />
        );
    }
  };

  const isAnalysisView = activeTab === 'analysis';

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 font-sans linear-grid selection:bg-sky-500/30 selection:text-white flex flex-col overflow-x-hidden">
      {/* Linear-Style Top Navigation (Completely removed on Analysis necklace view as requested) */}
      {!isAnalysisView && (
        <LinearNavbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          systemStatus={systemStatus}
          currentUser={currentUser}
          onLoginClick={() => setActiveTab('login')}
          onLogoutClick={handleLogout}
        />
      )}

      {/* Main Viewport */}
      <main className={isAnalysisView ? "w-full min-h-screen p-0 m-0 overflow-x-hidden" : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4"}>
        {renderActivePage()}
      </main>

      {/* Linear-Style Minimal Footer (Completely removed on Analysis necklace view as requested) */}
      {!isAnalysisView && (
        <footer className="w-full border-t border-white/[0.06] bg-[#050608]/80 backdrop-blur-md py-6 px-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-slate-400 font-semibold">Marine Debris Segmentation</span>
              <span>• Vision Transformer Engine</span>
            </div>
            <div>
              <span>Linear UI Style Architecture • Express + FastAPI + PyTorch MPS</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
