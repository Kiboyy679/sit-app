import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const menuItems = [
  { label: 'Dashboard', route: 'dashboard', icon: '📊' },
  { label: 'Arsip Konten', route: 'content.index', icon: '📁' },
  { label: 'Laporan FYP', route: 'fyp.index', icon: '📈' },
  { label: 'Pengajuan Izin', route: 'leave.index', icon: '📝' },
  { label: 'Kehadiran', route: 'attendance.index', icon: '📅' },
];

const adminItems = [
  { label: 'Laporan Kinerja', route: 'performance.index', icon: '🏆', roles: ['super_admin'] },
  { label: 'Import Data', route: 'import.index', icon: '📥', roles: ['super_admin'] },
  { label: 'Jejak Audit', route: 'audit.index', icon: '🔍', roles: ['super_admin'] },
  { label: 'Pengguna', route: 'users.index', icon: '👥', roles: ['super_admin'] },
  { label: 'Alias', route: 'aliases.index', icon: '🏷️', roles: ['super_admin'] },
  { label: 'Tema', route: 'themes.index', icon: '🎨', roles: ['super_admin', 'admin_konten'] },
];

export default function Sidebar() {
  const { url } = usePage();
  const { auth } = usePage().props;
  const userRoles = auth?.user?.roles || [];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen fixed left-0 top-0 pt-16">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-[#6bfb9a]">SIT-APP</h1>
        <p className="text-xs text-white/40">Sistem Pemantauan Kinerja</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.route}
            href={route(item.route)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              url.startsWith('/' + item.route.split('.')[0])
                ? 'bg-[#6bfb9a]/10 text-[#6bfb9a] font-medium'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Admin Section */}
        {adminItems.some(item => item.roles.some(r => userRoles.includes(r))) && (
          <>
            <div className="border-t border-white/10 my-3" />
            <div className="px-3 py-1 text-xs text-white/30 uppercase tracking-wider">Admin</div>
            {adminItems.filter(item => item.roles.some(r => userRoles.includes(r))).map((item) => (
              <Link
                key={item.route}
                href={route(item.route)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  url.startsWith('/' + item.route.split('.')[0])
                    ? 'bg-[#6bfb9a]/10 text-[#6bfb9a] font-medium'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#6bfb9a]/20 flex items-center justify-center text-[#6bfb9a] text-sm font-bold">
            {auth?.user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{auth?.user?.name}</div>
            <div className="text-xs text-white/40 truncate">{auth?.user?.unit}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
