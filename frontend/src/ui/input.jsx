import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={
      `rounded-xl border border-slate-700 bg-slate-950/80 text-slate-100 ` +
      `placeholder:text-slate-500 px-3 py-2 outline-none ` +
      `focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 ` +
      className
    }
  />
);
