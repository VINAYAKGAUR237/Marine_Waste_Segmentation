import React from 'react';

export default function StatCard({ title, value, unit = '', subtitle, icon: Icon, trend, color = 'cyan' }) {
  const colorStyles = {
    cyan: 'from-cyan-500/20 to-ocean-800 text-cyan-400 border-cyan-500/30',
    emerald: 'from-emerald-500/20 to-ocean-800 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-ocean-800 text-amber-400 border-amber-500/30',
    purple: 'from-purple-500/20 to-ocean-800 text-purple-400 border-purple-500/30',
    coral: 'from-rose-500/20 to-ocean-800 text-rose-400 border-rose-500/30',
  }[color] || 'from-cyan-500/20 to-ocean-800 text-cyan-400 border-cyan-500/30';

  return (
    <div className="glass-panel rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorStyles} border flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className="text-emerald-400 font-mono font-medium">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
