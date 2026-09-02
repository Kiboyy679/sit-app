import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-secondary/10 text-secondary',
    danger: 'bg-error/10 text-error',
    warning: 'bg-tertiary/10 text-tertiary',
    info: 'bg-primary/10 text-primary',
    neon: 'bg-primary/10 text-primary',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
