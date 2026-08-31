import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

const platformIcons = {
  tiktok: '🎵', instagram: '📸', youtube: '▶️',
  facebook: '📘', x: '✖️', threads: '🧵',
};

export default function IdentityIndex({ identities, brands }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [search, setSearch] = useState('');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '', brand: '', platform: 'tiktok', account_handle: '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (editing) {
      put(route('identity.update', editing.id), { onSuccess: () => { setEditing(null); setShowForm(false); reset(); } });
    } else {
      post(route('identity.store'), { onSuccess: () => { setShowForm(false); reset(); } });
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setData({ name: item.name, brand: item.brand, platform: item.platform, account_handle: item.account_handle });
    setShowForm(true);
  };

  const handleMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;
    router.post(route('identity.merge'), { source_id: mergeSource, target_id: mergeTarget }, { preserveScroll: true });
    setMergeSource(''); setMergeTarget('');
  };

  const doSearch = (e) => {
    e.preventDefault();
    router.get(route('identity.index', { search }));
  };

  return (
    <AppLayout>
      <Head title="Manajemen Identitas" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Manajemen Identitas</h1>
            <p className="text-white/50 text-sm">{identities.total} identitas terdaftar</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); }}>
            {showForm ? 'Tutup' : '+ Tambah Identitas'}
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={doSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, brand, platform..."
            className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:ring-2 focus:ring-[#6bfb9a]/50 outline-none"
          />
          <Button type="submit" variant="secondary">Cari</Button>
        </form>

        {/* Form */}
        {showForm && (
          <GlassCard title={editing ? 'Edit Identitas' : 'Tambah Identitas'}>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama *" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
              <Input label="Brand *" value={data.brand} onChange={(e) => setData('brand', e.target.value)} error={errors.brand} required />
              <div>
                <label className="block text-sm text-white/60 mb-1">Platform *</label>
                <select value={data.platform} onChange={(e) => setData('platform', e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  {['tiktok','instagram','youtube','facebook','x','threads'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <Input label="Account Handle *" value={data.account_handle} onChange={(e) => setData('account_handle', e.target.value)} error={errors.account_handle} placeholder="@username" required />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={processing}>{editing ? 'Simpan' : 'Tambah'}</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Merge Panel */}
        {identities.data.length > 1 && (
          <GlassCard title="Gabungkan Identitas">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Sumber (dihapus)</label>
                <select value={mergeSource} onChange={(e) => setMergeSource(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  <option value="">Pilih...</option>
                  {identities.data.map(i => <option key={i.id} value={i.id}>{i.name} ({i.platform})</option>)}
                </select>
              </div>
              <div className="text-white/30 pb-2">→</div>
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Tujuan (tetap)</label>
                <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  <option value="">Pilih...</option>
                  {identities.data.map(i => <option key={i.id} value={i.id}>{i.name} ({i.platform})</option>)}
                </select>
              </div>
              <Button onClick={handleMerge} variant="secondary">Gabungkan</Button>
            </div>
          </GlassCard>
        )}

        {/* Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="py-3 px-3">Nama</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Handle</th>
                  <th className="py-3 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {identities.data.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3 text-white font-medium">{item.name}</td>
                    <td className="py-3 px-3 text-white/60">{item.brand}</td>
                    <td className="py-3 px-3">
                      <Badge variant="neon">{platformIcons[item.platform] || '📱'} {item.platform}</Badge>
                    </td>
                    <td className="py-3 px-3 text-white/60 font-mono text-xs">{item.account_handle}</td>
                    <td className="py-3 px-3 flex gap-2">
                      <Link href={route('identity.detail', item.id)} className="text-[#6bfb9a] hover:underline text-xs">Detail</Link>
                      <button onClick={() => startEdit(item)} className="text-yellow-400 hover:underline text-xs">Edit</button>
                      <button onClick={() => router.delete(route('identity.destroy', item.id), { preserveScroll: true })}
                        className="text-red-400 hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {identities.data.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <div className="text-4xl mb-3">🔍</div>
                <p>Tidak ada identitas ditemukan</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pagination */}
        {identities.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {identities.links.map((link, idx) => (
              <button key={idx} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  link.active ? 'bg-[#6bfb9a]/20 text-[#6bfb9a] font-medium'
                  : link.url ? 'bg-white/5 text-white/60 hover:bg-white/10'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`} dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
