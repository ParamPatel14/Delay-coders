import React from 'react';

export const Card = ({ className = '', children }) => (
  <div
    className={
      `rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl ` +
      `shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition ` +
      className
    }
  >
    {children}
  </div>
);

export const CardHeader = ({ className = '', children }) => (
  <div className={`px-4 pt-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ className = '', children }) => (
  <div className={`text-sm font-medium text-zinc-400 tracking-wide ${className}`}>{children}</div>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`px-4 pb-4 ${className}`}>{children}</div>
);
