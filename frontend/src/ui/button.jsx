import React from 'react';

export const Button = ({ className = '', children, ...props }) => (
  <button
    {...props}
    className={
      `inline-flex items-center justify-center rounded-xl border px-3 py-2 ` +
      `border-gray-300 bg-white text-gray-700 ` +
      `hover:bg-gray-50 ` +
      `transition ` +
      className
    }
  >
    {children}
  </button>
);
