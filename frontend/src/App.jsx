import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ImageAnalysis from './pages/ImageAnalysis';
import MarineDebris from './pages/MarineDebris';
import MicroplasticAnalysis from './pages/MicroplasticAnalysis';
import ModelPerformance from './pages/ModelPerformance';
import DatasetPage from './pages/DatasetPage';
import PreprocessingPlayground from './pages/PreprocessingPlayground';
import AboutProject from './pages/AboutProject';
import ResearchHome from './pages/ResearchHome';
import { fetchHealth, fetchModelInfo, toggleDemoMode } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('research');
  const [systemStatus, setSystemStatus] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Initial health and model info fetch
    fetchHealth()
      .then((data) => {
        setSystemStatus(data);
        setIsDemoMode(data.is_demo_mode);
      })
      .catch((err) => console.warn('Backend not responding yet:', err));

    fetchModelInfo()
      .then((data) => setModelInfo(data))
      .catch((err) => console.warn('Model info error:', err));
  }, []);

  const handleToggleDemo = async () => {
    try {
      const nextState = !isDemoMode;
      const res = await toggleDemoMode(nextState);
      setIsDemoMode(res.is_demo_mode);
    } catch (err) {
      console.error('Failed to toggle demo mode:', err);
    }
  };

  // If in flagship research publication view, render dedicated research layout
  if (activeTab === 'research') {
    return (
      <ResearchHome
        onSwitchToDashboard={() => setActiveTab('dashboard')}
      />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} />;
      case 'dashboard':
        return <Dashboard modelInfo={modelInfo} onNavigate={setActiveTab} />;
      case 'analysis':
        return <ImageAnalysis isDemoMode={isDemoMode} />;
      case 'debris':
        return <MarineDebris />;
      case 'microplastics':
        return <MicroplasticAnalysis />;
      case 'performance':
        return <ModelPerformance />;
      case 'dataset':
        return <DatasetPage />;
      case 'preprocessing':
        return <PreprocessingPlayground />;
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard modelInfo={modelInfo} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Navigation */}
      <Navbar
        systemStatus={systemStatus}
        isDemoMode={isDemoMode}
        onToggleDemo={handleToggleDemo}
        onSwitchToResearch={() => setActiveTab('research')}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Mobile Tab Navigation */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-3 mb-4 border-b border-slate-200 text-xs font-medium">
            {[
              { id: 'research', label: 'Paper & Lab' },
              { id: 'landing', label: 'Platform' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'analysis', label: 'Analysis' },
              { id: 'debris', label: 'Debris' },
              { id: 'microplastics', label: 'Microplastics' },
              { id: 'performance', label: 'Performance' },
              { id: 'dataset', label: 'Dataset' },
              { id: 'preprocessing', label: 'Preprocessing' },
              { id: 'about', label: 'About' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
