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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around py-2">
      {items.map((item) => (
        <Link
          key={item.route}
          href={route(item.route)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
            url.startsWith('/' + item.route.split('.')[0])
              ? 'text-[#6bfb9a]'
              : 'text-white/40'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
