import React from 'react';

export const Card = ({ className = '', children }) => (
  <div
    className={
      `rounded-xl border border-gray-200 bg-white shadow-sm ` +
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
  <div className={`text-sm font-medium text-gray-600 tracking-wide ${className}`}>{children}</div>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`px-4 pb-4 ${className}`}>{children}</div>
);
