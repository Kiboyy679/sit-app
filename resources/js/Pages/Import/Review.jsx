import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';

export default function ImportReview({ batch, rows, stats, anomalies }) {
  const [showAll, setShowAll] = useState(false);
  const { post, processing } = useForm({});

  const visibleRows = showAll ? rows : rows.slice(0, 50);

  const skipRow = (idx) => {
    router.post(route('import.skipRow', batch.id), { row_index: idx }, { preserveScroll: true });
  };

  const commitAll = () => {
    router.post(route('import.commit', batch.id), {}, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Review Import" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Data Import</h1>
          <p className="text-white/50 text-sm">Periksa data sebelum commit ke database</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: '📊', color: 'text-white' },
            { label: 'Valid', value: stats.valid, icon: '✅', color: 'text-[#6bfb9a]' },
            { label: 'Invalid', value: stats.invalid, icon: '❌', color: 'text-red-400' },
            { label: 'Anomali', value: stats.anomalies, icon: '⚠️', color: 'text-yellow-400' },
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

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <GlassCard title={`Anomali Terdeteksi (${anomalies.length})`}>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {anomalies.map((a, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded ${
                  a.severity === 'error' ? 'bg-red-500/10 text-red-400' :
                  a.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  [{a.type}] Baris {a.row}: {a.message}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Row Table */}
        <GlassCard title="Data Baris">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">URL</th>
                  <th className="py-2 px-3">Platform</th>
                  <th className="py-2 px-3">Karyawan</th>
                  <th className="py-2 px-3">Penayangan</th>
                  <th className="py-2 px-3">Interaksi</th>
                  <th className="py-2 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => {
                  const d = row.data;
                  return (
                    <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 ${
                      row.status === 'skipped' ? 'opacity-30' : ''
                    } ${row.is_duplicate_url ? 'bg-yellow-500/5' : ''}`}>
                      <td className="py-2 px-3 text-white/40">{row.row}</td>
                      <td className="py-2 px-3">
                        {row.status === 'valid' && <Badge variant="success">Valid</Badge>}
                        {row.status === 'invalid' && <Badge variant="danger">Invalid</Badge>}
                        {row.status === 'duplicate' && <Badge variant="warning">Duplikat</Badge>}
                        {row.status === 'warning' && <Badge variant="warning">Warning</Badge>}
                        {row.status === 'skipped' && <Badge>Lewati</Badge>}
                      </td>
                      <td className="py-2 px-3 text-white/60 text-xs max-w-[200px] truncate">{d.original_url || '-'}</td>
                      <td className="py-2 px-3 text-white/60 capitalize">{d.platform || '-'}</td>
                      <td className="py-2 px-3 text-white/60">{d.user_name || d.employee_name || '-'}</td>
                      <td className="py-2 px-3 text-white/60 text-right">{d.impressions || '0'}</td>
                      <td className="py-2 px-3 text-white/60 text-right">{d.engagements || '0'}</td>
                      <td className="py-2 px-3">
                        {row.status !== 'skipped' && row.status !== 'invalid' && (
                          <button onClick={() => skipRow(idx)} className="text-red-400 hover:underline text-xs">Lewati</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <button onClick={() => setShowAll(!showAll)} className="text-[#6bfb9a] text-sm mt-3 hover:underline">
              {showAll ? 'Tampilkan lebih sedikit' : `Tampilkan semua ${rows.length} baris`}
            </button>
          )}
        </GlassCard>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => history.back()}>Kembali</Button>
          <Button onClick={commitAll} disabled={processing || stats.valid === 0}>
            {processing ? 'Memproses...' : `Commit ${stats.valid} Baris Valid`}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
