import React from 'react';

export const HoloBadge = ({ level = 5, title = 'Earth Guardian' }) => (
  <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_10%_10%,rgba(0,255,148,0.15),transparent_40%),radial-gradient(600px_circle_at_90%_90%,rgba(0,184,255,0.15),transparent_40%)]" />
    <div className="relative">
      <div className="text-xs text-zinc-400 tracking-wide">Badge</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-white">Level {level}</div>
        <div className="text-sm text-[#00FF94]">{title}</div>
      </div>
      <div className="mt-3 text-xs text-zinc-500">A holographic card earned for consistent carbon savings</div>
    </div>
  </div>
);
