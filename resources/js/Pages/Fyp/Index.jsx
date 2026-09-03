import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

const platforms = [
  { value: '', label: 'Semua' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'threads', label: 'Threads' },
];

const platformIcons = {
  tiktok: 'music_note',
  instagram: 'photo_camera',
  youtube: 'play_arrow',
  facebook: 'facebook',
  x: 'close',
  threads: 'forum',
};

const statuses = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function FypIndex({ reports, themes, stats, karyawanList }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user?.roles?.some(r => ['super_admin', 'admin_fyp'].includes(r));

  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    original_url: '',
    platform: 'tiktok',
    theme_id: '',
    post_type: 'main',
    impressions: '',
    engagements: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('fyp.store'), {
      onSuccess: () => { setShowSubmit(false); reset(); },
    });
  };

  const reviewReport = (reportId, status) => {
    router.put(route('fyp.review', reportId), { status }, { preserveScroll: true });
  };

  const bulkReview = (status) => {
    if (selectedIds.length === 0) return;
    router.post(route('fyp.bulkReview'), { ids: selectedIds, status }, {
      preserveScroll: true,
      onSuccess: () => setSelectedIds([]),
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pendingIds = reports.data.filter(r => r.status === 'pending').map(r => r.id);
    setSelectedIds(prev => prev.length === pendingIds.length ? [] : pendingIds);
  };

  const applyFilter = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.get(route('fyp.index') + '?' + params.toString());
  };

  return (
    <AppLayout>
      <Head title="Laporan FYP" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Pelaporan FYP</h1>
            <p className="text-on-surface-variant text-sm">Postingan ke platform sosial media</p>
          </div>
          <Button onClick={() => setShowSubmit(!showSubmit)} className="w-full sm:w-auto">
            {showSubmit ? 'Tutup' : '+ Kirim Laporan'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Menunggu', value: stats.pending, color: 'text-yellow-600', icon: '⏳' },
            { label: 'Disetujui', value: stats.approved, color: 'text-secondary', icon: '✅' },
            { label: 'Ditolak', value: stats.rejected, color: 'text-error', icon: '❌' },
            { label: 'Total Bulan Ini', value: stats.total, color: 'text-primary', icon: '📊' },
          ].map((s, i) => (
            <div key={i} className="glass-panel border border-outline-variant/30 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">{s.icon}</span>
              <div>
                <div className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-on-surface-variant/70 text-[10px] sm:text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Form */}
        {showSubmit && (
          <GlassCard title="Kirim Laporan FYP">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="URL Postingan *"
                    value={data.original_url}
                    onChange={(e) => setData('original_url', e.target.value)}
                    error={errors.original_url}
                    placeholder="https://www.tiktok.com/@user/video/123..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Platform *</label>
                  <select
                    value={data.platform}
                    onChange={(e) => setData('platform', e.target.value)}
                    className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  >
                    {platforms.filter(p => p.value).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Tema *</label>
                  <select
                    value={data.theme_id}
                    onChange={(e) => setData('theme_id', e.target.value)}
                    className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  >
                    <option value="">Pilih tema</option>
                    {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {errors.theme_id && <p className="text-xs text-error mt-1">{errors.theme_id}</p>}
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Jenis Postingan *</label>
                  <select
                    value={data.post_type}
                    onChange={(e) => setData('post_type', e.target.value)}
                    className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface"
                  >
                    <option value="main">Postingan Utama</option>
                    <option value="reply">Balasan</option>
                    <option value="comment">Komentar</option>
                  </select>
                </div>
                <div>
                  <Input
                    label="Penayangan (Impressions) *"
                    type="number"
                    value={data.impressions}
                    onChange={(e) => setData('impressions', e.target.value)}
                    error={errors.impressions}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Interaksi (Engagements) *"
                    type="number"
                    value={data.engagements}
                    onChange={(e) => setData('engagements', e.target.value)}
                    error={errors.engagements}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Mengirim...' : 'Kirim Laporan'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowSubmit(false); reset(); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); applyFilter('status', e.target.value); }}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm"
          >
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            value={filterPlatform}
            onChange={(e) => { setFilterPlatform(e.target.value); applyFilter('platform', e.target.value); }}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm"
          >
            {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          {isAdmin && selectedIds.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-on-surface-variant self-center">{selectedIds.length} dipilih</span>
              <Button size="sm" onClick={() => bulkReview('approved')}>
                Setujui Semua
              </Button>
              <Button size="sm" variant="danger" onClick={() => bulkReview('rejected')}>
                Tolak Semua
              </Button>
            </div>
          )}
        </div>

        {/* ===== DESKTOP TABLE (md+) ===== */}
        <GlassCard className="hidden md:block">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                  {isAdmin && <th className="py-3 px-3 w-8">
                    <input type="checkbox" onChange={toggleSelectAll}
                      checked={reports.data.filter(r => r.status === 'pending').length > 0 && selectedIds.length === reports.data.filter(r => r.status === 'pending').length}
                      className="rounded border-outline-variant/50"
                    />
                  </th>}
                  <th className="py-3 px-3">URL / Platform</th>
                  <th className="py-3 px-3">Tema</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3 text-right">Penayangan</th>
                  <th className="py-3 px-3 text-right">Interaksi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Karyawan</th>
                  {isAdmin && <th className="py-3 px-3">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {reports.data.map((report) => (
                  <tr key={report.id} className={`border-b border-outline-variant/20 hover:bg-surface-container-low/50 ${selectedIds.includes(report.id) ? 'bg-primary/5' : ''}`}>
                    {isAdmin && (
                      <td className="py-3 px-3">
                        {report.status === 'pending' && (
                          <input type="checkbox" checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelect(report.id)}
                            className="rounded border-outline-variant/50"
                          />
                        )}
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <div className="text-on-surface truncate max-w-xs">{report.original_url}</div>
                      <div className="text-xs text-on-surface-variant/70 capitalize">{report.platform}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="neon">{report.theme?.name || '-'}</Badge>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant capitalize">{report.post_type}</td>
                    <td className="py-3 px-3 text-right text-on-surface">{(report.impressions || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-on-surface">{(report.engagements || 0).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <Badge variant={
                        report.status === 'approved' ? 'success' :
                        report.status === 'rejected' ? 'danger' : 'warning'
                      }>
                        {report.status === 'approved' ? 'Disetujui' :
                         report.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                      </Badge>
                      {report.engagement_exceeds_views && (
                        <span className="ml-1 text-yellow-600" title="Interaksi melebihi penayangan">⚠️</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant text-xs">{report.user?.name}</td>
                    {isAdmin && (
                      <td className="py-3 px-3">
                        {report.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => reviewReport(report.id, 'approved')}
                              className="text-secondary hover:underline text-xs">✓</button>
                            <button onClick={() => reviewReport(report.id, 'rejected')}
                              className="text-error hover:underline text-xs">✕</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.data.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant/50">
                <div className="text-4xl mb-3">📭</div>
                <p>Belum ada laporan FYP</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* ===== MOBILE CARDS (< md) ===== */}
        <div className="md:hidden space-y-3 max-w-full overflow-hidden">
          {isAdmin && reports.data.some(r => r.status === 'pending') && (
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" onChange={toggleSelectAll}
                checked={reports.data.filter(r => r.status === 'pending').length > 0 && selectedIds.length === reports.data.filter(r => r.status === 'pending').length}
                className="rounded border-outline-variant/50"
              />
              <span className="text-xs text-on-surface-variant">Pilih semua pending</span>
            </div>
          )}
          {reports.data.map((report) => (
            <div key={report.id} className={`bg-white border border-outline-variant/30 rounded-xl p-4 space-y-3 max-w-full overflow-hidden ${selectedIds.includes(report.id) ? 'border-primary/50 bg-primary/5' : ''}`}>
              {/* Top row: platform + status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAdmin && report.status === 'pending' && (
                    <input type="checkbox" checked={selectedIds.includes(report.id)}
                      onChange={() => toggleSelect(report.id)}
                      className="rounded border-outline-variant/50"
                    />
                  )}
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {platformIcons[report.platform] || 'link'}
                  </span>
                  <span className="text-xs font-medium text-on-surface-variant capitalize">{report.platform}</span>
                  {report.post_type !== 'main' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-on-surface-variant capitalize">{report.post_type}</span>
                  )}
                </div>
                <Badge variant={
                  report.status === 'approved' ? 'success' :
                  report.status === 'rejected' ? 'danger' : 'warning'
                }>
                  {report.status === 'approved' ? '✓ Disetujui' :
                   report.status === 'rejected' ? '✕ Ditolak' : '⏳ Menunggu'}
                </Badge>
              </div>

              {/* URL */}
              <div className="text-xs text-on-surface truncate max-w-full" title={report.original_url}>
                {report.original_url}
              </div>

              {/* Theme + Employee */}
              <div className="flex items-center justify-between">
                <Badge variant="neon">{report.theme?.name || '-'}</Badge>
                <span className="text-[11px] text-on-surface-variant">{report.user?.name}</span>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">visibility</span>
                  <span className="text-xs font-medium text-on-surface">{(report.impressions || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">thumb_up</span>
                  <span className="text-xs font-medium text-on-surface">{(report.engagements || 0).toLocaleString()}</span>
                </div>
                {report.engagement_exceeds_views && (
                  <span className="text-yellow-600 text-xs" title="Interaksi melebihi penayangan">⚠️</span>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && report.status === 'pending' && (
                <div className="flex gap-2 pt-1 border-t border-outline-variant/20">
                  <button
                    onClick={() => reviewReport(report.id, 'approved')}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                  >
                    ✓ Setujui
                  </button>
                  <button
                    onClick={() => reviewReport(report.id, 'rejected')}
                    className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-700 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
                  >
                    ✕ Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
          {reports.data.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant/50">
              <div className="text-4xl mb-3">📭</div>
              <p>Belum ada laporan FYP</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reports.last_page > 1 && (
          <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
            {reports.links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                  link.active
                    ? 'bg-primary/10 text-primary font-medium'
                    : link.url
                    ? 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high'
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
