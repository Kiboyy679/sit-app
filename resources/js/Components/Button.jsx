import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', disabled, loading, className = '', ...props }) {
  const variants = {
    primary: 'bg-[var(--accent)] hover:brightness-110 text-black font-semibold',
    secondary: 'clay bg-white/10 hover:bg-white/20 text-white border border-white/15',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    ghost: 'hover:bg-white/10 text-white/70',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? 'Memproses...' : children}
    </button>
  );
}
