import React from 'react';

export default function StatCard({ label, value, icon, color = 'neon', trend }) {
  const colorMap = {
    neon: 'text-[#6bfb9a]',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center gap-4">
      {icon && (
        <div className={`text-3xl ${colorMap[color] || 'text-neon'}`}>{icon}</div>
      )}
      <div>
        <div className={`text-2xl font-bold ${colorMap[color] || 'text-neon'}`}>{value}</div>
        <div className="text-white/60 text-sm">{label}</div>
      </div>
      {trend && (
        <div className={`ml-auto text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}
