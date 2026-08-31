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
  const typeColor = { izin: 'info', sakit: 'warning', cuti: 'neon', 'dinas_luar': 'default', lainnya: 'default' };

  return (
    <AppLayout>
      <Head title="Pengajuan Izin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pengajuan Izin</h1>
            <p className="text-white/50 text-sm">Ajukan atau kelola pengajuan izin</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup' : '+ Ajukan Izin'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Menunggu', value: stats.pending, color: 'text-yellow-400', icon: '⏳' },
            { label: 'Disetujui', value: stats.approved, color: 'text-green-400', icon: '✅' },
            { label: 'Ditolak', value: stats.rejected, color: 'text-red-400', icon: '❌' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Form */}
        {showForm && (
          <GlassCard title="Ajukan Izin Baru">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm text-white/60 mb-1">Jenis *</label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white"
                  >
                    {leaveTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Keterangan *</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:ring-2 focus:ring-[#6bfb9a]/50 outline-none h-20 resize-none"
                  placeholder="Jelaskan alasan pengajuan izin..."
                  required
                />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
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
                  <tr key={leave.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3 text-white">{leave.user?.name}</td>
                    <td className="py-3 px-3">
                      <Badge variant={typeColor[leave.type] || 'default'}>{typeLabel(leave.type)}</Badge>
                    </td>
                    <td className="py-3 px-3 text-white/60 text-xs">
                      {leave.start_date} — {leave.end_date}
                    </td>
                    <td className="py-3 px-3 text-white/60 max-w-xs truncate">{leave.description}</td>
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
                          <div className="flex gap-1">
                            <button onClick={() => reviewLeave(leave.id, 'approved')}
                              className="text-green-400 hover:underline text-xs">✓ Setujui</button>
                            <button onClick={() => reviewLeave(leave.id, 'rejected')}
                              className="text-red-400 hover:underline text-xs">✕ Tolak</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {leaves.data.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3">📝</div>
                <p>Belum ada pengajuan izin</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pagination */}
        {leaves.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {leaves.links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  link.active ? 'bg-[#6bfb9a]/20 text-[#6bfb9a] font-medium'
                  : link.url ? 'bg-white/5 text-white/60 hover:bg-white/10'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
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
