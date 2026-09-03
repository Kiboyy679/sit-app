import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import KpiCard from '@/Components/KpiCard';

export default function Dashboard({ stats, role }) {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">
                        {role === 'super_admin' && 'Dashboard Super Admin'}
                        {role === 'admin_konten' && 'Dashboard Admin Konten'}
                        {role === 'admin_fyp' && 'Dashboard Admin FYP'}
                        {role === 'admin_absensi' && 'Dashboard Admin Absensi'}
                        {role === 'karyawan' && 'Dashboard Karyawan'}
                    </h2>
                    <p className="text-on-surface-variant mt-1 text-sm">
                        {role === 'super_admin' && 'Ringkasan seluruh sistem.'}
                        {role === 'admin_konten' && 'Pemantauan konten kreatif.'}
                        {role === 'admin_fyp' && 'Pemantauan laporan FYP.'}
                        {role === 'admin_absensi' && 'Pemantauan kehadiran karyawan.'}
                        {role === 'karyawan' && 'Ringkasan aktivitas Anda.'}
                    </p>
                </div>
                {role === 'super_admin' && (
                    <div className="flex items-center gap-3">
                        <a href="/import" className="glass-panel px-4 py-2 rounded-md text-sm font-medium text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            Impor CSV
                        </a>
                    </div>
                )}
            </div>

            {/* ===== KPI Grid berdasarkan Role ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Super Admin KPI */}
                {role === 'super_admin' && (
                    <>
                        <KpiCard icon="inventory_2" label="Total Konten" value={stats?.content_count ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="trending_up" label="FYP Disetujui" value={stats?.fyp_approved ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="visibility" label="Total Views" value={(stats?.total_views ?? 0).toLocaleString()} variant="primary" trend="up" trendLabel={`${(stats?.total_views ?? 0).toLocaleString()}`} />
                        <KpiCard icon="group" label="Total Karyawan" value={stats?.total_karyawan ?? 0} trend="up" trendLabel="Aktif" />
                    </>
                )}

                {/* Admin Konten KPI */}
                {role === 'admin_konten' && (
                    <>
                        <KpiCard icon="inventory_2" label="Konten Bulan Ini" value={stats?.content_count ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="visibility" label="Total Views" value={(stats?.total_views ?? 0).toLocaleString()} variant="primary" trend="up" trendLabel={`${(stats?.total_views ?? 0).toLocaleString()}`} />
                        <KpiCard icon="article" label="Laporan Terakhir" value={stats?.recent_content?.length ?? 0} trend="neutral" trendLabel="Terbaru" />
                        <KpiCard icon="check_circle" label="Total File" value={stats?.content_count ?? 0} trend="up" trendLabel="File" />
                    </>
                )}

                {/* Admin FYP KPI */}
                {role === 'admin_fyp' && (
                    <>
                        <KpiCard icon="pending_actions" label="FYP Pending" value={stats?.fyp_pending ?? 0} trend="down" trendLabel="Perlu review" />
                        <KpiCard icon="check_circle" label="FYP Disetujui" value={stats?.fyp_approved ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="cancel" label="FYP Ditolak" value={stats?.fyp_rejected ?? 0} trend="down" trendLabel="Bulan ini" />
                        <KpiCard icon="trending_up" label="Total FYP" value={(stats?.fyp_pending ?? 0) + (stats?.fyp_approved ?? 0) + (stats?.fyp_rejected ?? 0)} variant="primary" trend="up" trendLabel="Semua" />
                    </>
                )}

                {/* Admin Absensi KPI */}
                {role === 'admin_absensi' && (
                    <>
                        <KpiCard icon="event_busy" label="Izin Pending" value={stats?.leaves_pending ?? 0} trend="down" trendLabel="Perlu acc" />
                        <KpiCard icon="how_to_reg" label="Hadir Hari Ini" value={stats?.hadir_today ?? 0} trend="up" trendLabel="Hadir" />
                        <KpiCard icon="person_off" label="Alfa Hari Ini" value={stats?.alfa_today ?? 0} trend="down" trendLabel="Alfa" />
                        <KpiCard icon="calendar_month" label="Total Kehadiran" value={(stats?.hadir_today ?? 0) + (stats?.alfa_today ?? 0)} variant="primary" trend="up" trendLabel="Hari ini" />
                    </>
                )}

                {/* Karyawan KPI */}
                {role === 'karyawan' && (
                    <>
                        <KpiCard icon="inventory_2" label="Konten Saya" value={stats?.content_count ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="visibility" label="Views Saya" value={(stats?.total_views ?? 0).toLocaleString()} variant="primary" trend="up" trendLabel={`${(stats?.total_views ?? 0).toLocaleString()}`} />
                        <KpiCard icon="trending_up" label="FYP Disetujui" value={stats?.fyp_approved ?? 0} trend="up" trendLabel="Bulan ini" />
                        <KpiCard icon="event_busy" label="Izin Pending" value={stats?.leaves_pending ?? 0} trend="neutral" trendLabel="Pengajuan" />
                    </>
                )}
            </div>

            {/* ===== Detail Sections ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 glass-panel rounded-xl p-6 ambient-shadow">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                        <h3 className="font-headline-sm text-on-surface">
                            {role === 'admin_absensi' ? 'Statistik Kehadiran Hari Ini' : 'Statistik Sistem'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {role === 'admin_absensi' ? (
                            <>
                                {[
                                    { label: 'Hadir Hari Ini', value: stats?.hadir_today ?? 0, icon: 'how_to_reg' },
                                    { label: 'Alfa Hari Ini', value: stats?.alfa_today ?? 0, icon: 'person_off' },
                                    { label: 'Izin Pending', value: stats?.leaves_pending ?? 0, icon: 'event_busy' },
                                    { label: 'Total Hari Ini', value: (stats?.hadir_today ?? 0) + (stats?.alfa_today ?? 0), icon: 'calendar_month' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-on-surface-variant">{item.label}</p>
                                            <p className="text-lg font-bold text-on-surface">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {[
                                    { label: 'Konten Bulan Ini', value: stats?.content_count ?? 0, icon: 'article' },
                                    { label: 'FYP Pending', value: stats?.fyp_pending ?? 0, icon: 'pending_actions' },
                                    { label: 'Izin Pending', value: stats?.leaves_pending ?? 0, icon: 'event_busy' },
                                    { label: 'Kehadiran Hari Ini', value: `${stats?.hadir_today ?? '-'}`, icon: 'how_to_reg' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-on-surface-variant">{item.label}</p>
                                            <p className="text-lg font-bold text-on-surface">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="glass-panel rounded-xl p-6 ambient-shadow flex flex-col">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
                        <h3 className="font-headline-sm text-on-surface">
                            {role === 'admin_absensi' ? 'Ringkasan Cepat' : 'Status Cepat'}
                        </h3>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        {role === 'admin_absensi' ? (
                            <>
                                {[
                                    { label: 'Hadir Hari Ini', value: stats?.hadir_today ?? 0, color: 'text-green-600', icon: 'how_to_reg' },
                                    { label: 'Alfa Hari Ini', value: stats?.alfa_today ?? 0, color: 'text-red-600', icon: 'person_off' },
                                    { label: 'Izin Pending', value: stats?.leaves_pending ?? 0, color: 'text-yellow-600', icon: 'event_busy' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center ${item.color} shrink-0 mt-1`}>
                                            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-on-surface">
                                                <span className="font-medium">{item.label}</span>
                                            </p>
                                            <p className={`text-lg font-bold ${item.color} mt-1`}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {[
                                    { label: 'Konten Bulan Ini', value: stats?.content_count ?? 0, color: 'text-primary', icon: 'article' },
                                    { label: 'FYP Pending Review', value: stats?.fyp_pending ?? 0, color: 'text-yellow-600', icon: 'pending_actions' },
                                    { label: 'Pengajuan Izin Pending', value: stats?.leaves_pending ?? 0, color: 'text-tertiary', icon: 'event_busy' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center ${item.color} shrink-0 mt-1`}>
                                            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-on-surface">
                                                <span className="font-medium">{item.label}</span>
                                            </p>
                                            <p className={`text-lg font-bold ${item.color} mt-1`}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}