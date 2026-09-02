import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', disabled, loading, className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm',
    secondary: 'border border-outline-variant text-on-surface hover:bg-surface-container-low',
    danger: 'bg-error text-on-error hover:bg-error/90',
    ghost: 'hover:bg-surface-container-high text-on-surface-variant',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`rounded-md font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? 'Memproses...' : children}
    </button>
  );
}
