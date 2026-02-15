import React from 'react';

export const HoloBadge = ({ level = 5, title = 'Earth Guardian' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="text-xs text-gray-600 tracking-wide">Badge</div>
    <div className="mt-1 flex items-baseline gap-2">
      <div className="text-2xl font-semibold text-gray-900">Level {level}</div>
      <div className="text-sm text-green-600">{title}</div>
    </div>
    <div className="mt-3 text-xs text-gray-500">Earned for consistent carbon savings</div>
  </div>
);
