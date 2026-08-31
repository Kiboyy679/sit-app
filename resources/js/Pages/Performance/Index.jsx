import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Badge from '@/Components/Badge';

const scoreColor = (score) => {
  if (score >= 70) return 'text-[#6bfb9a]';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

const scoreLabel = (score) => {
  if (score >= 70) return 'Sangat Baik';
  if (score >= 50) return 'Baik';
  if (score >= 30) return 'Cukup';
  return 'Perlu Perbaikan';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Laporan Kinerja Karyawan</h1>
            <p className="text-white/50 text-sm">Rekap kinerja bulanan &amp; skor karyawan</p>
          </div>
        </div>

        {/* Period Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => changePeriod(-1)} className="text-white/50 hover:text-white text-lg">◀</button>
          <span className="text-white font-semibold text-lg">
            {new Date(period + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changePeriod(1)} className="text-white/50 hover:text-white text-lg">▶</button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Karyawan', value: rekap.length, icon: '👥', color: 'text-[#6bfb9a]' },
            { label: 'Total FYP', value: totalFyp, icon: '📈', color: 'text-blue-400' },
            { label: 'Rata-rata Skor', value: rekap.length > 0 ? Math.round(rekap.reduce((s, r) => s + r.score, 0) / rekap.length) : 0, icon: '🏆', color: 'text-yellow-400' },
            { label: 'Kehadiran', value: totalAtt > 0 ? Math.round((attendanceSummary.hadir / totalAtt) * 100) + '%' : '-', icon: '📅', color: 'text-green-400' },
          ].map((c, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                <div className="text-white/40 text-xs">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rekap Karyawan */}
          <div className="lg:col-span-2">
            <GlassCard title="Rekap Kinerja Karyawan">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/50">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Nama</th>
                      <th className="py-3 px-3 text-center">Konten</th>
                      <th className="py-3 px-3 text-center">Views</th>
                      <th className="py-3 px-3 text-center">FYP ✓</th>
                      <th className="py-3 px-3 text-center">Alfa</th>
                      <th className="py-3 px-3 text-center">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.map((k, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 text-white/40">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="text-white">{k.name}</div>
                          <div className="text-xs text-white/40">{k.unit || '-'}</div>
                        </td>
                        <td className="py-3 px-3 text-center text-white">{k.content_count}</td>
                        <td className="py-3 px-3 text-center text-white">{(k.total_views || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-green-400">{k.fyp_approved}</td>
                        <td className="py-3 px-3 text-center">
                          {k.alfa > 0 ? <span className="text-red-400">{k.alfa}</span> : <span className="text-white/30">0</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-white/10 rounded-full h-2">
                              <div className={`h-2 rounded-full ${k.score >= 70 ? 'bg-[#6bfb9a]' : k.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: Math.min(k.score, 100) + '%' }} />
                            </div>
                            <span className={`text-sm font-bold ${scoreColor(k.score)}`}>{k.score}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Status FYP Pie */}
            <GlassCard title="Status FYP">
              <div className="space-y-3">
                {[
                  { label: 'Disetujui', value: fypStatus.approved, color: 'bg-green-400' },
                  { label: 'Menunggu', value: fypStatus.pending, color: 'bg-yellow-400' },
                  { label: 'Ditolak', value: fypStatus.rejected, color: 'bg-red-400' },
                ].map((item, i) => {
                  const pct = totalFyp > 0 ? Math.round((item.value / totalFyp) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>{item.label}</span>
                        <span>{item.value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5">
                        <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Distribusi Tema Bar */}
            <GlassCard title="Tema Populer">
              <div className="space-y-2">
                {themeDistribution.slice(0, 8).map((theme, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-24 text-xs text-white/60 truncate" title={theme.name}>{theme.name}</div>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className="bg-[#6bfb9a]/70 h-2 rounded-full"
                        style={{ width: (theme.usage_count / maxThemeUsage * 100) + '%' }} />
                    </div>
                    <span className="text-xs text-white/40 w-6 text-right">{theme.usage_count}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Kehadiran Pie */}
            <GlassCard title="Kehadiran Bulanan">
              <div className="space-y-2">
                {[
                  { label: 'Hadir', value: attendanceSummary.hadir, color: 'text-green-400', icon: '✅' },
                  { label: 'Izin', value: attendanceSummary.izin, color: 'text-blue-400', icon: '📝' },
                  { label: 'Sakit', value: attendanceSummary.sakit, color: 'text-yellow-400', icon: '🤒' },
                  { label: 'Alfa', value: attendanceSummary.alfa, color: 'text-red-400', icon: '❌' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-white/60">{item.icon} {item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Recent Activity */}
        <GlassCard title="Aktivitas Terbaru (7 Hari)">
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                    {log.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{log.user?.name || 'System'}</span>
                    <span className="text-sm text-white/50 ml-1">{actionLabels[log.action] || log.action}</span>
                  </div>
                  <span className="text-xs text-white/30">{log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-4">Belum ada aktivitas</p>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}
