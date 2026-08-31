import React from 'react';

export default function ProgressBar({ percent = 0, label, color = 'accent' }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: Math.min(percent, 100) + '%' }} />
      </div>
    </div>
  );
}
