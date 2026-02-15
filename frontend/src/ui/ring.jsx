import React from 'react';

export const GlowRing = ({ value = 0, label = 'Total Carbon Offset', accent = '#00FF94' }) => {
  const pct = Math.max(0, Math.min(100, value));
  const deg = (pct / 100) * 360;
  const ringStyle = {
    backgroundImage: `conic-gradient(${accent} ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`,
  };
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex items-center justify-between">
      <div className="w-32 h-32 rounded-full relative shadow-[0_0_60px_0_rgba(0,255,148,0.2)]" style={ringStyle}>
        <div className="absolute inset-[12px] rounded-full bg-zinc-950 shadow-[inset_0_0_40px_rgba(255,255,255,0.06)] flex items-center justify-center">
          <div className="text-lg font-semibold text-white">{pct}%</div>
        </div>
      </div>
      <div className="ml-6">
        <div className="text-sm text-zinc-400">{label}</div>
        <div className="text-3xl font-semibold text-white tracking-tight">
          {(pct / 100).toFixed(2)} tCO₂e
        </div>
        <div className="mt-2 h-1 w-32 rounded-full bg-[linear-gradient(90deg,#00FF94,#00B8FF)]" />
      </div>
    </div>
  );
};
