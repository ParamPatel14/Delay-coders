import React from 'react';

export const Button = ({ className = '', children, ...props }) => (
  <button
    {...props}
    className={
      `inline-flex items-center justify-center rounded-[9999px] border px-3 py-2 ` +
      `border-emerald-400/70 bg-emerald-500/20 text-emerald-100 ` +
      `hover:bg-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.6)] ` +
      `transition disabled:opacity-50 ` +
      className
    }
  >
    {children}
  </button>
);
