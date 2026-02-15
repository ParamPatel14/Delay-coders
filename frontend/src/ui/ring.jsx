import React from 'react';

export const GlowRing = ({ value = 0, label = 'Total Carbon Offset', accent = '#10B981' }) => {
  const pct = Math.max(0, Math.min(100, value));
  const deg = (pct / 100) * 360;
  const ringStyle = {
    backgroundImage: `conic-gradient(${accent} ${deg}deg, rgba(0,0,0,0.08) ${deg}deg)`,
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between">
      <div className="w-32 h-32 rounded-full relative" style={ringStyle}>
        <div className="absolute inset-[12px] rounded-full bg-gray-50 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-900">{pct}%</div>
        </div>
      </div>
      <div className="ml-6">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-3xl font-semibold text-gray-900 tracking-tight">
          {(pct / 100).toFixed(2)} tCO₂e
        </div>
        <div className="mt-2 h-1 w-32 rounded-full bg-green-500/70" />
      </div>
    </div>
  );
};
