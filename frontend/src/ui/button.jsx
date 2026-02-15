import React from 'react';

export const Button = ({ className = '', children, ...props }) => (
  <button
    {...props}
    className={
      `inline-flex items-center justify-center rounded-xl border px-3 py-2 ` +
      `border-white/10 bg-zinc-900/60 text-white ` +
      `hover:bg-zinc-800/60 hover:border-white/20 ` +
      `ring-1 ring-inset ring-white/5 transition ` +
      `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ` +
      `data-[accent=true]:bg-[linear-gradient(90deg,#00FF94,#00B8FF)] ` +
      className
    }
  >
    {children}
  </button>
);
