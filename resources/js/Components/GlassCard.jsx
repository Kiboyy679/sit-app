import React from 'react';

export default function GlassCard({ title, children, footerAction, className = '' }) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">
          {title}
        </h3>
      )}
      <div className="text-white/80">{children}</div>
      {footerAction && (
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
          {footerAction}
        </div>
      )}
    </div>
  );
}
