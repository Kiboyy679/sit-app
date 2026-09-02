import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

export default function IdentityDetail({ identity, records }) {
  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    record_date: new Date().toISOString().slice(0, 10),
    impressions: '', engagements: '', notes: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('identity.storeRecord', identity.id), { onSuccess: () => { setShowForm(false); reset(); } });
  };

  return (
    <AppLayout>
      <Head title={identity.name} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.get(route('identity.index'))} className="text-on-surface-variant/70 text-sm hover:text-on-surface mb-1">← Kembali</button>
            <h1 className="text-2xl font-bold text-on-surface">{identity.name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="neon">{identity.platform}</Badge>
              <Badge variant="default">{identity.brand}</Badge>
              <span className="text-on-surface-variant/70 text-sm self-center font-mono">{identity.account_handle}</span>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup' : '+ Tambah Data'}
          </Button>
        </div>

        {/* Add Record Form */}
        {showForm && (
          <GlassCard title="Tambah Data Identitas">
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Tanggal *" type="date" value={data.record_date} onChange={(e) => setData('record_date', e.target.value)} required />
              <Input label="Penayangan" type="number" value={data.impressions} onChange={(e) => setData('impressions', e.target.value)} error={errors.impressions} placeholder="0" />
              <Input label="Interaksi" type="number" value={data.engagements} onChange={(e) => setData('engagements', e.target.value)} error={errors.engagements} placeholder="0" />
              <div className="md:col-span-3">
                <label className="block text-sm text-on-surface-variant mb-1">Catatan</label>
                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface placeholder:text-on-surface-variant/30 h-16 resize-none outline-none"
                  placeholder="Catatan opsional..." />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit" disabled={processing}>Simpan</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); reset(); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Records Table */}
        <GlassCard title={`Riwayat Data (${records.total})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3 text-right">Penayangan</th>
                  <th className="py-3 px-3 text-right">Interaksi</th>
                  <th className="py-3 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {records.data.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                    <td className="py-3 px-3 text-on-surface">{r.record_date}</td>
                    <td className="py-3 px-3 text-right text-on-surface">{(r.impressions || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-on-surface">{(r.engagements || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-on-surface-variant text-xs max-w-xs truncate">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.data.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant/50">Belum ada data riwayat</div>
            )}
          </div>
        </GlassCard>

        {/* Pagination */}
        {records.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {records.links.map((link, idx) => (
              <button key={idx} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  link.active ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high'
                }`} dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
