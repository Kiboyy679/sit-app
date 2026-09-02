import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-1">{label}</label>}
      <input
        className={`w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
