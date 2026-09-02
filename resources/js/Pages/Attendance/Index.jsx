import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';

const statusColors = {
  hadir: 'success', izin: 'info', sakit: 'warning',
  alfa: 'danger', 'dinas_luar': 'default', 'tugas_luar': 'neon',
};

const statusLabels = {
  hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit',
  alfa: 'Alfa', 'dinas_luar': 'Dinas Luar', 'tugas_luar': 'Tugas Luar',
};

export default function AttendanceIndex({ attendances, summary, month, users }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user?.roles?.some(r => ['super_admin', 'admin_absensi'].includes(r));

  const changeMonth = (delta) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newMonth = d.toISOString().slice(0, 7);
    router.get(route('attendance.index', { month: newMonth }));
  };

  // Generate calendar days
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getAttendanceForDate = (dateStr) => {
    return attendances.filter(a => a.date && a.date.startsWith(dateStr));
  };

  const statusIcon = (status) => {
    const icons = { hadir: '✅', izin: '📝', sakit: '🤒', alfa: '❌', 'dinas_luar': '🚗', 'tugas_luar': '✈️' };
    return icons[status] || '❓';
  };

  // Summary stats
  const totalHadir = Object.values(summary).reduce((sum, s) => sum + s.hadir, 0);
  const totalAlfa = Object.values(summary).reduce((sum, s) => sum + s.alfa, 0);

  return (
    <AppLayout>
      <Head title="Kehadiran" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Kehadiran Karyawan</h1>
            <p className="text-on-surface-variant text-sm">Rekap kehadiran bulanan</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={() => window.open(route('attendance.export', { month }), '_blank')}>
                📥 Ekspor CSV
              </Button>
            )}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => changeMonth(-1)} className="text-on-surface-variant hover:text-on-surface text-lg">◀</button>
          <span className="text-on-surface font-semibold text-lg">
            {new Date(year, mon - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="text-on-surface-variant hover:text-on-surface text-lg">▶</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Hadir', value: totalHadir, color: 'text-secondary', icon: '✅' },
            { label: 'Total Izin', value: Object.values(summary).reduce((s, v) => s + v.izin, 0), color: 'text-blue-400', icon: '📝' },
            { label: 'Total Sakit', value: Object.values(summary).reduce((s, v) => s + v.sakit, 0), color: 'text-yellow-600', icon: '🤒' },
            { label: 'Total Alfa', value: totalAlfa, color: 'text-error', icon: '❌' },
          ].map((s, i) => (
            <div key={i} className="glass-panel border border-outline-variant/30 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-on-surface-variant/70 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <GlassCard title="Kalender Kehadiran">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="text-xs text-on-surface-variant/70 py-2 font-medium">{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAttendances = getAttendanceForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().slice(0, 10);

              return (
                <div key={day} className={`aspect-square rounded-lg p-1 border text-xs ${
                  isToday ? 'border-primary bg-primary/5' : 'border-outline-variant/20 bg-white/3'
                }`}>
                  <div className={`text-xs mb-0.5 ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{day}</div>
                  <div className="space-y-0.5">
                    {dayAttendances.slice(0, 3).map((a) => (
                      <div key={a.id} className="text-[9px] truncate" title={`${a.user?.name}: ${statusLabels[a.status]}`}>
                        {statusIcon(a.status)} {a.user?.name?.split(' ')[0]}
                      </div>
                    ))}
                    {dayAttendances.length > 3 && (
                      <div className="text-[9px] text-on-surface-variant/50">+{dayAttendances.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Per-User Summary Table */}
        {isAdmin && Object.keys(summary).length > 0 && (
          <GlassCard title="Rekap per Karyawan">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                    <th className="py-3 px-3">Nama</th>
                    <th className="py-3 px-3 text-center">Hadir</th>
                    <th className="py-3 px-3 text-center">Izin</th>
                    <th className="py-3 px-3 text-center">Sakit</th>
                    <th className="py-3 px-3 text-center">Alfa</th>
                    <th className="py-3 px-3 text-center">Tingkat Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary).map(([id, s]) => {
                    const total = s.hadir + s.izin + s.sakit + s.alfa;
                    const rate = total > 0 ? Math.round((s.hadir / total) * 100) : 0;
                    return (
                      <tr key={id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                        <td className="py-3 px-3 text-on-surface">{s.name}</td>
                        <td className="py-3 px-3 text-center text-secondary">{s.hadir}</td>
                        <td className="py-3 px-3 text-center text-blue-400">{s.izin}</td>
                        <td className="py-3 px-3 text-center text-yellow-600">{s.sakit}</td>
                        <td className="py-3 px-3 text-center text-error">{s.alfa}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-container-high rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${rate >= 90 ? 'bg-green-400' : rate >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${rate >= 90 ? 'text-secondary' : rate >= 70 ? 'text-yellow-600' : 'text-error'}`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
