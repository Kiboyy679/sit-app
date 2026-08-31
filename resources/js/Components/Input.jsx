import React from 'react';

export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm text-white/60 mb-1">{label}</label>
      )}
      <input
        id={inputId}
        className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? inputId + '-error' : undefined}
        {...props}
      />
      {error && <p id={inputId + '-error'} className="mt-1 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
