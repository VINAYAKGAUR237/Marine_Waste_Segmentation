import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import DepthIndicator from '../components/DepthIndicator';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import ArchitectureViewer from '../components/ArchitectureViewer';
import FeatureInspection from '../components/FeatureInspection';
import ExperimentLab from '../components/ExperimentLab';
import ResultsTable from '../components/ResultsTable';
import DatasetExplorer from '../components/DatasetExplorer';
import PipelineTimeline from '../components/PipelineTimeline';
import PaperCitation from '../components/PaperCitation';

export default function ResearchHome({ onSwitchToDashboard }) {
  const [activeSection, setActiveSection] = useState('hero');

  // Smooth scroll handler for waypoints
  const handleNavigateSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = [
      'hero',
      'problem',
      'question',
      'architecture',
      'features',
      'lab',
      'ablation',
      'results',
      'datasets',
      'paper'
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-500/20 selection:text-sky-900 relative">
      {/* Top Academic Lab Navigation Bar */}
      <Navigation
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* Side Ocean Depth Indicator (0m Surface down to 1200m Deep Sea) */}
      <DepthIndicator
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Publication Document Flow */}
      <main className="relative z-10">
        {/* 00. Hero Section */}
        <HeroSection
          onNavigateSection={handleNavigateSection}
          onSwitchToDashboard={onSwitchToDashboard}
        />

        {/* 01. Physical Optical Problem Breakdown & Research Hypothesis */}
        <ProblemSection
          onExploreArchitecture={() => handleNavigateSection('architecture')}
        />

        {/* 02. MiT-B0 Multi-Task Architecture Schematic & Component Inspector */}
        <ArchitectureViewer />

        {/* 03. "What The Model Sees" Stage-by-Stage Feature Scrubber */}
        <FeatureInspection />

        {/* 04. Centerpiece Interactive Scientific Experiment Lab */}
        <ExperimentLab />

        {/* 05. Research Pipeline Timeline (01 to 06) */}
        <PipelineTimeline />

        {/* 06. Empirical Benchmarks Table & 3-Variant Ablation Study */}
        <ResultsTable />

        {/* 07. Marine Pollution & Deep-Sea Datasets Documentation */}
        <DatasetExplorer />

        {/* 08. Academic Citation, Abstract, BibTeX Block & Footer */}
        <PaperCitation />
      </main>
    </div>
  );
}
