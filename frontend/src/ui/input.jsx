import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={
      `rounded-xl border border-gray-300 bg-white text-gray-900 ` +
      `placeholder:text-gray-400 px-3 py-2 outline-none ` +
      `focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ` +
      className
    }
  />
);
