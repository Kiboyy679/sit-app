import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const items = [
  { label: 'Beranda', route: 'dashboard', icon: '🏠' },
  { label: 'Arsip', route: 'content.index', icon: '📁' },
  { label: 'FYP', route: 'fyp.index', icon: '📈' },
  { label: 'Izin', route: 'leave.index', icon: '📝' },
];

export default function BottomNav() {
  const { url } = usePage();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4" aria-label="Navigasi mobile">
      <div className="glass rounded-[28px] border border-white/50 ring-1 ring-white/30 shadow-[0_8px_32px_rgba(31,41,55,0.18)] flex justify-around px-2 py-3 w-full max-w-[480px]">
        {items.map((item) => {
          const isActive = url.startsWith('/' + item.route.split('.')[0]);
          return (
            <Link
              key={item.route}
              href={route(item.route)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${
                isActive
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}