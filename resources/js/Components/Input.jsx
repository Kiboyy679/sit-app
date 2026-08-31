import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-white/60 mb-1">{label}</label>}
      <input
        className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:ring-2 focus:ring-[#6bfb9a]/50 focus:border-[#6bfb9a] outline-none transition-all"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
