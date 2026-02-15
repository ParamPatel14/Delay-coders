import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={
      `rounded-xl border border-white/10 bg-zinc-900/60 text-white ` +
      `placeholder:text-zinc-500 px-3 py-2 outline-none ` +
      `focus:ring-2 focus:ring-[#00FF94]/30 focus:border-white/20 ` +
      className
    }
  />
);
