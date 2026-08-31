import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';

export default function ArchiveVerify({ results, allValid, period }) {
  return (
    <AppLayout>
      <Head title="Verifikasi Arsip" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Verifikasi Arsip</h1>
            <p className="text-white/50 text-sm">Periode: {period}</p>
          </div>
          <Badge variant={allValid ? 'success' : 'danger'}>
            {allValid ? '✓ Semua Valid' : '✕ Ada Ketidaksesuaian'}
          </Badge>
        </div>

        <GlassCard title="Hasil Verifikasi Checksum">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="py-3 px-3">File</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Hash (Expected)</th>
                  <th className="py-3 px-3">Hash (Actual)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3 text-white">{r.file}</td>
                    <td className="py-3 px-3">
                      <Badge variant={r.valid ? 'success' : 'danger'}>
                        {r.valid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-white/40 text-xs font-mono break-all">{r.expected || '-'}</td>
                    <td className="py-3 px-3 text-white/40 text-xs font-mono break-all">{r.actual || r.error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <Button variant="ghost" onClick={() => router.get(route('archive.index'))}>← Kembali</Button>
      </div>
    </AppLayout>
  );
}
