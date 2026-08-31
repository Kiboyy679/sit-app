import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';

export default function ArchiveIndex({ archives }) {
  const { data, setData, post, processing } = useForm({ week: new Date().toISOString().slice(0, 10) });

  const generate = (e) => {
    e.preventDefault();
    post(route('archive.generate'));
  };

  return (
    <AppLayout>
      <Head title="Arsip Mingguan" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Arsip Mingguan</h1>
          <p className="text-white/50 text-sm">Buat paket arsip materi + checksum verifikasi</p>
        </div>

        <GlassCard title="Buat Arsip Baru">
          <form onSubmit={generate} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-1">Minggu (tanggal awal minggu)</label>
              <input type="date" value={data.week} onChange={(e) => setData('week', e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white" />
            </div>
            <Button type="submit" disabled={processing}>{processing ? 'Membuat...' : 'Buat Arsip'}</Button>
          </form>
        </GlassCard>

        <GlassCard title="Daftar Arsip">
          {archives.length > 0 ? (
            <div className="space-y-2">
              {archives.map((a, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm text-white">{a.name}</div>
                    <div className="text-xs text-white/40">{a.file_count} berkas</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.has_checksum ? 'success' : 'warning'}>
                      {a.has_checksum ? 'Checksum ✓' : 'Tanpa Checksum'}
                    </Badge>
                    <Button size="sm" variant="secondary" onClick={() => router.get(route('archive.verify', a.name))}>
                      Verifikasi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">Belum ada arsip</p>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}
