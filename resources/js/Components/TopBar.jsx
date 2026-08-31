import React from 'react';
import { router } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function TopBar() {
  return (
    <header className="glass h-16 fixed top-0 left-0 right-0 lg:left-64 z-50 flex items-center justify-between px-6" role="banner">
      <div className="lg:hidden text-lg font-bold text-[var(--accent)]">SIT-APP</div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={() => router.post(route('logout'))}
          className="text-sm text-white/50 hover:text-white transition-colors"
          aria-label="Keluar dari akun"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
