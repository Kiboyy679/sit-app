import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

export default function Themes({ themes }) {
  const [showForm, setShowForm] = useState(false);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

  const canonical = themes.filter(t => t.is_canonical);
  const candidates = themes.filter(t => !t.is_canonical);

  const submit = (e) => {
    e.preventDefault();
    post(route('themes.store'), { onSuccess: () => { setShowForm(false); reset(); } });
  };

  const handleMerge = () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;
    router.post(route('themes.merge', mergeSource), { source_id: mergeSource, target_id: mergeTarget }, { preserveScroll: true });
    setMergeSource(''); setMergeTarget('');
  };

  return (
    <AppLayout>
      <Head title="Tema" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Manajemen Tema</h1>
            <p className="text-white/50 text-sm">{canonical.length} tema aktif, {candidates.length} calon tema</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Tutup' : '+ Tambah Tema'}</Button>
        </div>

        {showForm && (
          <GlassCard title="Tambah Tema">
            <form onSubmit={submit} className="flex gap-4 items-end">
              <div className="flex-1">
                <Input label="Nama Tema" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="e.g. Tips & Trik" required />
              </div>
              <Button type="submit" disabled={processing}>Tambah</Button>
            </form>
          </GlassCard>
        )}

        {/* Merge Panel */}
        {canonical.length > 1 && (
          <GlassCard title="Gabungkan Tema">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Tema Sumber (akan dihapus)</label>
                <select value={mergeSource} onChange={(e) => setMergeSource(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  <option value="">Pilih...</option>
                  {canonical.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="text-white/30 pb-2">→</div>
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-1">Tema Tujuan (akan bertambah)</label>
                <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  <option value="">Pilih...</option>
                  {canonical.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <Button onClick={handleMerge} variant="secondary">Gabungkan</Button>
            </div>
          </GlassCard>
        )}

        {/* Canonical Themes */}
        <GlassCard title={`Tema Aktif (${canonical.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {canonical.map((theme) => (
              <div key={theme.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/5">
                <div>
                  <div className="text-sm text-white">{theme.name}</div>
                  <div className="text-xs text-white/40">Dipakai {theme.usage_count}x</div>
                </div>
                <button onClick={() => router.delete(route('themes.destroy', theme.id), { preserveScroll: true })} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Candidates */}
        {candidates.length > 0 && (
          <GlassCard title={`Calon Tema (${candidates.length})`}>
            <div className="space-y-2">
              {candidates.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2 border border-white/5">
                  <span className="text-sm text-white/70">{theme.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => router.post(route('themes.approve', theme.id), {}, { preserveScroll: true })} className="text-green-400 hover:underline text-xs">Setujui</button>
                    <button onClick={() => router.delete(route('themes.destroy', theme.id), { preserveScroll: true })} className="text-red-400 hover:underline text-xs">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
