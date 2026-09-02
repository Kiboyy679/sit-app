import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Konten', href: '/content', icon: 'inventory_2', roles: ['super_admin', 'admin_konten'] },
    { label: 'FYP', href: '/fyp', icon: 'trending_up', roles: ['super_admin', 'admin_fyp'] },
    { label: 'Absensi', href: '/attendance', icon: 'calendar_today', roles: ['super_admin', 'admin_absensi', 'karyawan'] },
    { label: 'Izin', href: '/leave', icon: 'event_note', roles: ['super_admin', 'admin_absensi', 'karyawan'] },
    { label: 'Laporan Kinerja', href: '/performance', icon: 'analytics', roles: ['super_admin'] },
    { label: 'Import', href: '/import', icon: 'upload_file', roles: ['super_admin'] },
    { label: 'Manajemen User', href: '/admin/users', icon: 'manage_accounts', roles: ['super_admin'] },
    { label: 'Audit Log', href: '/audit', icon: 'history', roles: ['super_admin'] },
    { label: 'Arsip', href: '/archive', icon: 'folder_zip', roles: ['super_admin'] },
];

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const userRoles = user?.roles || [];
    const primaryRole = userRoles[0] || 'karyawan';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const filteredNav = navItems.filter(item =>
        !item.roles || item.roles.includes(primaryRole)
    );

    // Mobile bottom nav: max 5 most relevant items
    const mobileNav = filteredNav;

    const Icon = ({ name, className = '' }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    return (
        <div className="min-h-screen bg-background flex font-body-md">
            <Head title="SIT-APP" />

            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[9999] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-br-lg focus:font-semibold">
                Langsung ke konten
            </a>

            {/* ===== SIDEBAR (desktop only, no logout button) ===== */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-outline-variant/50 bg-white py-6 z-50">
                <div className="px-6 pb-6 mb-2 border-b border-outline-variant/50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary font-bold text-xl">shield</span>
                    </div>
                    <div>
                        <h1 className="font-headline-sm font-bold text-primary">SIT-APP</h1>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Monitoring Kinerja</p>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-1 mt-4 px-2 overflow-y-auto">
                    {filteredNav.map(item => {
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                    ${isActive
                                        ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary'
                                        : 'text-on-surface-variant hover:bg-primary/5 border-r-4 border-transparent'
                                    }`}
                            >
                                <Icon name={item.icon} className="text-[20px]" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-on-surface truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-on-surface-variant truncate capitalize">{primaryRole.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ===== TOP BAR (shared desktop+mobile, single logout button) ===== */}
            <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-14 border-b border-outline-variant/50 bg-white z-40 flex justify-between items-center px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <span className="md:hidden text-lg font-bold text-primary">SIT-APP</span>
                    <div className="hidden sm:block relative w-64">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                        <input
                            type="text"
                            placeholder="Cari data..."
                            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/60"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="pl-3 border-l border-outline-variant/50 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-on-surface">{user?.name || 'User'}</span>
                    </div>
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-semibold"
                    >
                        <Icon name="logout" className="text-[16px]" />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main id="main-content" className="flex-1 md:ml-64 pt-14 pb-20 md:pb-6 min-h-screen" role="main">
                <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 sm:gap-8">
                    {children}
                </div>
            </main>

            {/* ===== BOTTOM NAV (mobile only, navigation only, NO logout) ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 border-t border-outline-variant/50 bg-white">
                <div className="flex justify-around items-center h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                    {mobileNav.map(item => {
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors text-[10px] font-semibold min-w-0 flex-1
                                    ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                            >
                                <Icon name={item.icon} className="text-[22px]" />
                                <span className="truncate max-w-[64px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
