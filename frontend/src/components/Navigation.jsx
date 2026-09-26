import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Cpu } from 'lucide-react';

export default function Navigation({ activeSection, onNavigateSection }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'features', label: 'Feature Maps' },
    { id: 'lab', label: 'Experiment Lab' },
    { id: 'results', label: 'Results' },
    { id: 'ablation', label: 'Ablation' },
    { id: 'datasets', label: 'Datasets' },
    { id: 'paper', label: 'Paper' },
  ];

  const handleNavClick = (id) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-3.5 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm py-4 border-b border-slate-100'
      }`}
      aria-label="Research Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Lab Identity */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:bg-sky-100 group-hover:border-sky-300 transition-colors shadow-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" strokeDasharray="2 2" />
              <path d="M3 12h18" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 font-sans group-hover:text-sky-700 transition-colors">
                MARINE VISION LAB
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100/70 text-sky-800 border border-sky-200 font-medium">
                MiT-B0 MTL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono tracking-tight block">
              Autonomous Systems & Oceanographic Vision
            </span>
          </div>
        </button>

        {/* Desktop Editorial Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`transition-colors hover:text-sky-600 relative py-1 cursor-pointer ${
                activeSection === link.id ? 'text-sky-600 font-bold' : ''
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Action Button & External Links */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('lab')}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Experiment Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('lab')}
              className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-semibold text-xs text-center cursor-pointer hover:bg-sky-700"
            >
              Launch Experiment Lab
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
