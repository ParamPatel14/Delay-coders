import React from 'react';

export const Card = ({ className = '', children }) => (
  <div
    className={
      `rounded-[24px] border border-white/10 bg-[#050505]/88 text-slate-50 ` +
      `shadow-[0_24px_80px_rgba(15,118,110,0.55)] backdrop-blur-xl ` +
      className
    }
  >
    {children}
  </div>
);

export const CardHeader = ({ className = '', children }) => (
  <div className={`px-5 pt-5 ${className}`}>{children}</div>
);

export const CardTitle = ({ className = '', children }) => (
  <div className={`text-sm font-semibold text-slate-50 tracking-tight ${className}`}>{children}</div>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`px-5 pb-5 ${className}`}>{children}</div>
);
