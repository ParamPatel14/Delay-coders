import React from 'react';

export const Sparkline = ({ data = [], width = 140, height = 36, color = '#00B8FF' }) => {
  if (!data || data.length === 0) return <div className="h-9" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = (v) => ((v - min) / (max - min || 1)) * (height - 4) + 2;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - norm(v)}`).join(' ');
  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};
