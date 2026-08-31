import React from 'react';

export default function StatCard({ label, value, icon, color = 'accent', trend }) {
  const colorMap = {
    accent: 'text-[var(--accent)]',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    pink: 'text-[var(--accent-alt)]',
  };
  return (
    <div className="clay p-5 flex items-center gap-4" role="status" aria-label={`${label}: ${value}`}>
      {icon && <div className={`text-3xl ${colorMap[color] || 'text-[var(--accent)]'}`} aria-hidden="true">{icon}</div>}
      <div>
        <div className={`text-2xl font-bold ${colorMap[color] || 'text-[var(--accent)]'}`}>{value}</div>
        <div className="text-white/60 text-sm">{label}</div>
      </div>
      {trend && (
        <div className={`ml-auto text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} aria-label={`Tren ${trend > 0 ? 'naik' : 'turun'} ${Math.abs(trend)}%`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
