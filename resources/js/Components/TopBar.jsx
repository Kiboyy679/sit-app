import React from 'react';
import { router } from '@inertiajs/react';

export default function TopBar() {
  return (
    <header className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 fixed top-0 left-0 right-0 lg:left-64 z-50 flex items-center justify-between px-6">
      <div className="lg:hidden text-lg font-bold text-[#6bfb9a]">SIT-APP</div>
      <div className="flex-1" />
      <button
        onClick={() => router.post(route('logout'))}
        className="text-sm text-white/50 hover:text-white transition-colors"
      >
        Keluar
      </button>
    </header>
  );
}
