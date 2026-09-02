import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

const leaveTypes = [
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'cuti', label: 'Cuti' },
  { value: 'dinas_luar', label: 'Dinas Luar' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function LeaveIndex({ leaves, stats, karyawanList }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user?.roles?.some(r => ['super_admin', 'admin_absensi'].includes(r));

  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    start_date: '', end_date: '', type: 'izin', description: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('leave.store'), {
      onSuccess: () => { setShowForm(false); reset(); },
    });
  };

  const reviewLeave = (leaveId, status) => {
    router.put(route('leave.review', leaveId), { status }, { preserveScroll: true });
  };

  const typeLabel = (t) => leaveTypes.find(l => l.value === t)?.label || t;
  const typeColor = { izin: 'info', sakit: 'warning', cuti: 'primary', 'dinas_luar': 'default', lainnya: 'default' };

  return (
    <AppLayout>
      <Head title="Pengajuan Izin" />
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Pengajuan Izin</h1>
            <p className="text-on-surface-variant text-sm">Ajukan atau kelola pengajuan izin</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto justify-center">
            {showForm ? 'Tutup' : '+ Ajukan Izin'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Menunggu', value: stats.pending, color: 'text-yellow-600', icon: '⏳' },
            { label: 'Disetujui', value: stats.approved, color: 'text-secondary', icon: '✅' },
            { label: 'Ditolak', value: stats.rejected, color: 'text-error', icon: '❌' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">{s.icon}</span>
              <div>
                <div className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-on-surface-variant/70 text-[10px] sm:text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Form */}
        {showForm && (
          <GlassCard title="Ajukan Izin Baru">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  label="Tanggal Mulai *"
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  error={errors.start_date}
                  required
                />
                <Input
                  label="Tanggal Akhir *"
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  error={errors.end_date}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-1">Jenis *</label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  >
                    {leaveTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-1">Keterangan *</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none h-20 resize-none"
                  placeholder="Jelaskan alasan pengajuan izin..."
                  required
                />
                {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={processing}>{processing ? 'Mengirim...' : 'Kirim Pengajuan'}</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Leave List */}
        <GlassCard title={`Daftar Pengajuan (${leaves.total})`}>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                  <th className="py-3 px-3">Karyawan</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Periode</th>
                  <th className="py-3 px-3">Keterangan</th>
                  <th className="py-3 px-3">Status</th>
                  {isAdmin && <th className="py-3 px-3">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.data.map((leave) => (
                  <tr key={leave.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                    <td className="py-3 px-3 text-on-surface font-medium">{leave.user?.name}</td>
                    <td className="py-3 px-3">
                      <Badge variant={typeColor[leave.type] || 'default'}>{typeLabel(leave.type)}</Badge>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant text-xs">
                      {leave.start_date} — {leave.end_date}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant max-w-[200px] truncate">{leave.description}</td>
                    <td className="py-3 px-3">
                      <Badge variant={
                        leave.status === 'approved' ? 'success' :
                        leave.status === 'rejected' ? 'danger' : 'warning'
                      }>
                        {leave.status === 'approved' ? 'Disetujui' :
                         leave.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-3">
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => reviewLeave(leave.id, 'approved')}
                              className="text-secondary hover:underline text-xs font-semibold">✓ Setujui</button>
                            <button onClick={() => reviewLeave(leave.id, 'rejected')}
                              className="text-error hover:underline text-xs font-semibold">✕ Tolak</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {leaves.data.map((leave) => (
              <div key={leave.id} className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">{leave.user?.name}</span>
                  <Badge variant={
                    leave.status === 'approved' ? 'success' :
                    leave.status === 'rejected' ? 'danger' : 'warning'
                  }>
                    {leave.status === 'approved' ? 'Disetujui' :
                     leave.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <Badge variant={typeColor[leave.type] || 'default'}>{typeLabel(leave.type)}</Badge>
                  <span>{leave.start_date} — {leave.end_date}</span>
                </div>
                <p className="text-xs text-on-surface-variant truncate">{leave.description}</p>
                {isAdmin && leave.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => reviewLeave(leave.id, 'approved')}>✓ Setujui</Button>
                    <Button size="sm" variant="danger" onClick={() => reviewLeave(leave.id, 'rejected')}>✕ Tolak</Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {leaves.data.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant/50">
              <div className="text-4xl mb-3">📝</div>
              <p>Belum ada pengajuan izin</p>
            </div>
          )}
        </GlassCard>

        {/* Pagination */}
        {leaves.last_page > 1 && (
          <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
            {leaves.links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                  link.active ? 'bg-primary/10 text-primary font-medium'
                  : link.url ? 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high'
                  : 'bg-surface-container-low/50 text-on-surface-variant/30 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
