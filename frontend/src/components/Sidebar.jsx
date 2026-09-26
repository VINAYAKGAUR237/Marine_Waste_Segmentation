import React from 'react';
import { 
  LayoutDashboard, 
  ScanSearch, 
  Trash2, 
  Microscope, 
  Activity, 
  Database, 
  Sliders, 
  BookOpen, 
  Anchor 
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'research', label: 'Research Publication', icon: BookOpen, badge: 'Flagship' },
    { id: 'landing', label: 'Platform Overview', icon: Anchor, badge: null },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'analysis', label: 'Image Analysis', icon: ScanSearch, badge: 'Live' },
    { id: 'debris', label: 'Marine Debris', icon: Trash2, badge: null },
    { id: 'microplastics', label: 'Microplastics', icon: Microscope, badge: null },
    { id: 'performance', label: 'Model Performance', icon: Activity, badge: null },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database, badge: null },
    { id: 'preprocessing', label: 'Preprocessing Lab', icon: Sliders, badge: 'CLAHE' },
    { id: 'about', label: 'About & Methodology', icon: BookOpen, badge: null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] shadow-xs">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
          SYSTEM NAVIGATION
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Edge Deployment Tag */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-sky-800 font-semibold mb-1">
          <Anchor className="w-4 h-4 text-sky-600" />
          <span>Edge Architecture</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
          Optimized for AUVs, ROVs & marine telemetry devices with unified CNN + ViT encoder.
        </p>
      </div>
    </aside>
  );
}
