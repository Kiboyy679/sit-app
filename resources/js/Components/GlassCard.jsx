import React from 'react';

export default function GlassCard({ title, children, footerAction, className = '' }) {
  return (
    <section className={`bg-white/80 backdrop-blur-md border border-outline-variant/50 shadow-sm rounded-xl p-6 ${className}`} aria-label={title || undefined}>
      {title && (
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 pb-3 border-b border-outline-variant/30">
          {title}
        </h3>
      )}
      <div className="text-on-surface overflow-x-hidden max-w-full">{children}</div>
      {footerAction && (
        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-end">
          {footerAction}
        </div>
      )}
    </section>
  );
}
