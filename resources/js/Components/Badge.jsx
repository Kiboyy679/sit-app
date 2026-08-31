import React from 'react';

export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 text-white/80',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    neon: 'bg-[#6bfb9a]/20 text-[#6bfb9a]',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
