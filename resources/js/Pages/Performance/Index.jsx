import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const scoreColor = (score) => {
    if (score >= 70) return 'text-secondary';
    if (score >= 40) return 'text-yellow-600';
    return 'text-error';
};

const scoreBarColor = (score) => {
    if (score >= 70) return 'bg-secondary';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-error';
};

export default function PerformanceIndex({ rekap, themeDistribution, fypStatus, attendanceSummary, recentActivity, period }) {
    const changePeriod = (delta) => {
        const [y, m] = period.split('-').map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        router.get(route('performance.index', { period: d.toISOString().slice(0, 7) }));
    };

    const totalFyp = fypStatus.approved + fypStatus.pending + fypStatus.rejected;
    const totalAtt = attendanceSummary.hadir + attendanceSummary.izin + attendanceSummary.sakit + attendanceSummary.alfa;
    const maxThemeUsage = Math.max(...themeDistribution.map(t => t.usage_count), 1);

    const actionLabels = {
        seed_data: 'Seed Data', update_views: 'Update Views', fyp_submit: 'Submit FYP',
        fyp_approved: 'Approve FYP', fyp_rejected: 'Reject FYP', fyp_bulk_approved: 'Bulk Approve',
        fyp_bulk_rejected: 'Bulk Reject', leave_submit: 'Submit Izin', leave_approved: 'Approve Izin',
        leave_rejected: 'Reject Izin', attendance_record: 'Record Absensi',
    };

    return (
        <AppLayout>
            <Head title="Laporan Kinerja" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg sm:text-headline-lg font-bold text-on-surface">Ringkasan Kinerja</h2>
                    <p className="text-on-surface-variant mt-1 text-sm">Pemantauan metrik sistem terkini.</p>
                </div>
                <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
                    <button onClick={() => changePeriod(-1)} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="px-3 font-mono-data text-sm font-semibold text-on-surface">
                        {new Date(period + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changePeriod(1)} className="p-1 rounded hover:bg-surface-variant text-on-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 ambient-shadow">
                    <div className="flex items-center justify-between text-on-surface-variant">
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Karyawan</span>
                        <span className="material-symbols-outlined text-primary text-[18px] sm:text-xl">group</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-on-surface">{rekap.length}</div>
                    <div className="text-[10px] sm:text-xs text-on-surface-variant mt-1">Aktif bulan ini</div>
                </div>
                <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 ambient-shadow">
                    <div className="flex items-center justify-between text-on-surface-variant">
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Rata-rata Skor</span>
                        <span className="material-symbols-outlined text-secondary text-[18px] sm:text-xl">analytics</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-on-surface">
                        {rekap.length > 0 ? Math.round(rekap.reduce((s, r) => s + r.score, 0) / rekap.length) : 0}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-secondary mt-1 font-medium">
                        <span className="material-symbols-outlined text-[12px] sm:text-[14px]">arrow_upward</span>
                        Target: 70+
                    </div>
                </div>
                <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 ambient-shadow">
                    <div className="flex items-center justify-between text-on-surface-variant">
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Kehadiran</span>
                        <span className="material-symbols-outlined text-secondary text-[18px] sm:text-xl">how_to_reg</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-on-surface">
                        {totalAtt > 0 ? Math.round((attendanceSummary.hadir / totalAtt) * 100) : 0}%
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-secondary mt-1 font-medium">
                        <span className="material-symbols-outlined text-[12px] sm:text-[14px]">arrow_upward</span>
                        {attendanceSummary.hadir} hadir
                    </div>
                </div>
                <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col gap-1 sm:gap-2 ambient-shadow">
                    <div className="flex items-center justify-between text-on-surface-variant">
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total FYP</span>
                        <span className="material-symbols-outlined text-primary text-[18px] sm:text-xl">trending_up</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-on-surface">{totalFyp}</div>
                    <div className="text-[10px] sm:text-xs text-on-surface-variant mt-1">{fypStatus.approved} disetujui</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* === Desktop table === */}
                <div className="hidden md:block lg:col-span-2 glass-panel rounded-xl flex flex-col ambient-shadow overflow-hidden">
                    <div className="p-5 border-b border-outline-variant/30">
                        <h3 className="font-headline-sm text-on-surface">Rekap Kinerja Karyawan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-container-low/50 text-left text-on-surface-variant">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Nama</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Konten</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Views</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">FYP ✓</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Alfa</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {rekap.map((k, idx) => (
                                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="px-4 py-3 text-on-surface-variant">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-on-surface font-medium">{k.name}</div>
                                            <div className="text-xs text-on-surface-variant">{k.unit || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-on-surface">{k.content_count}</td>
                                        <td className="px-4 py-3 text-center text-on-surface">{(k.total_views || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center text-secondary font-medium">{k.fyp_approved}</td>
                                        <td className="px-4 py-3 text-center">
                                            {k.alfa > 0 ? <span className="text-error font-medium">{k.alfa}</span> : <span className="text-on-surface-variant/40">0</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-16 bg-surface-container-high rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${scoreBarColor(k.score)}`} style={{ width: Math.min(k.score, 100) + '%' }} />
                                                </div>
                                                <span className={`text-sm font-bold ${scoreColor(k.score)}`}>{k.score}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* === Mobile card list === */}
                <div className="md:hidden lg:col-span-2 space-y-3">
                    <div className="glass-panel rounded-xl p-4 ambient-shadow">
                        <h3 className="font-headline-sm text-on-surface mb-3 pb-2 border-b border-outline-variant/30">Rekap Kinerja Karyawan</h3>
                    </div>
                    {rekap.map((k, idx) => (
                        <div key={idx} className="glass-panel rounded-xl p-4 ambient-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-on-surface-variant bg-surface-container-high w-6 h-6 rounded-full flex items-center justify-center font-bold">{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface">{k.name}</p>
                                        <p className="text-[10px] text-on-surface-variant">{k.unit || '-'}</p>
                                    </div>
                                </div>
                                <span className={`text-lg font-bold ${scoreColor(k.score)}`}>{k.score}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-on-surface-variant">
                                <div><span className="block text-sm font-bold text-on-surface">{k.content_count}</span>Konten</div>
                                <div><span className="block text-sm font-bold text-on-surface">{(k.total_views || 0).toLocaleString()}</span>Views</div>
                                <div><span className="block text-sm font-bold text-secondary">{k.fyp_approved}</span>FYP ✓</div>
                                <div><span className="block text-sm font-bold">{k.alfa > 0 ? <span className="text-error">{k.alfa}</span> : '0'}</span>Alfa</div>
                            </div>
                            <div className="mt-2">
                                <div className="w-full bg-surface-container-high rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${scoreBarColor(k.score)}`} style={{ width: Math.min(k.score, 100) + '%' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Status FYP */}
                    <div className="glass-panel rounded-xl p-4 sm:p-5 ambient-shadow">
                        <h3 className="font-headline-sm text-on-surface mb-3 pb-2 border-b border-outline-variant/30 text-sm">Status FYP</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Disetujui', value: fypStatus.approved, color: 'bg-secondary' },
                                { label: 'Menunggu', value: fypStatus.pending, color: 'bg-yellow-500' },
                                { label: 'Ditolak', value: fypStatus.rejected, color: 'bg-error' },
                            ].map((item, i) => {
                                const pct = totalFyp > 0 ? Math.round((item.value / totalFyp) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                                            <span>{item.label}</span>
                                            <span>{item.value} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-surface-container-high rounded-full h-2.5">
                                            <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: pct + '%' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tema Populer */}
                    <div className="glass-panel rounded-xl p-4 sm:p-5 ambient-shadow">
                        <h3 className="font-headline-sm text-on-surface mb-3 pb-2 border-b border-outline-variant/30 text-sm">Tema Populer</h3>
                        <div className="space-y-2">
                            {themeDistribution.slice(0, 6).map((theme, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-20 sm:w-24 text-xs text-on-surface-variant truncate" title={theme.name}>{theme.name}</div>
                                    <div className="flex-1 bg-surface-container-high rounded-full h-2">
                                        <div className="bg-primary/70 h-2 rounded-full" style={{ width: (theme.usage_count / maxThemeUsage * 100) + '%' }} />
                                    </div>
                                    <span className="text-xs text-on-surface-variant w-6 text-right">{theme.usage_count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Kehadiran */}
                    <div className="glass-panel rounded-xl p-4 sm:p-5 ambient-shadow">
                        <h3 className="font-headline-sm text-on-surface mb-3 pb-2 border-b border-outline-variant/30 text-sm">Kehadiran Bulanan</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Hadir', value: attendanceSummary.hadir, color: 'text-secondary', icon: 'check_circle' },
                                { label: 'Izin', value: attendanceSummary.izin, color: 'text-primary', icon: 'description' },
                                { label: 'Sakit', value: attendanceSummary.sakit, color: 'text-yellow-600', icon: 'sick' },
                                { label: 'Alfa', value: attendanceSummary.alfa, color: 'text-error', icon: 'cancel' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-on-surface-variant flex items-center gap-1">
                                        <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${item.color}`}>{item.icon}</span>
                                        {item.label}
                                    </span>
                                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel rounded-xl ambient-shadow overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-outline-variant/30">
                    <h3 className="font-headline-sm text-on-surface text-sm">Aktivitas Terbaru (7 Hari)</h3>
                </div>
                {recentActivity.length > 0 ? (
                    <div className="flex flex-col gap-0 divide-y divide-outline-variant/20">
                        {recentActivity.map((log) => (
                            <div key={log.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-surface-container-low/50 transition-colors">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">person</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs sm:text-sm text-on-surface font-medium">{log.user?.name || 'System'}</span>
                                    <span className="text-xs sm:text-sm text-on-surface-variant ml-1">{actionLabels[log.action] || log.action}</span>
                                </div>
                                <span className="text-[10px] sm:text-xs text-on-surface-variant whitespace-nowrap">
                                    {log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID') : '-'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-on-surface-variant/50 text-sm text-center py-8">Belum ada aktivitas</p>
                )}
            </div>
        </AppLayout>
    );
}
