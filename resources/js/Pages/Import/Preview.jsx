import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';

const knownFields = [
  { value: '', label: '— Abaikan —' },
  { value: 'employee_name', label: 'Nama Karyawan' },
  { value: 'original_url', label: 'URL Postingan' },
  { value: 'platform', label: 'Platform' },
  { value: 'theme_name', label: 'Tema' },
  { value: 'impressions', label: 'Penayangan' },
  { value: 'engagements', label: 'Interaksi' },
  { value: 'date', label: 'Tanggal' },
  { value: 'post_type', label: 'Jenis Postingan' },
];

export default function ImportPreview({ batch, headers, sampleRows, detectedMapping }) {
  const { data, setData, post, processing } = useForm({ mapping: detectedMapping || {} });

  const submit = (e) => {
    e.preventDefault();
    post(route('import.process', batch.id));
  };

  return (
    <AppLayout>
      <Head title="Pratinjau Import" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pratinjau — {batch.file_name}</h1>
          <p className="text-white/50 text-sm">{batch.total_rows} baris terdeteksi</p>
        </div>

        {/* Mapping Table */}
        <GlassCard title="Pemetaan Kolom">
          <form onSubmit={submit} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/50">
                    <th className="py-2 px-3">Kolom CSV</th>
                    <th className="py-2 px-3">Contoh Nilai</th>
                    <th className="py-2 px-3">Pemetaan</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((h, idx) => {
                    const sampleVal = sampleRows[0]?.[idx] || '';
                    const mapped = data.mapping[idx] || '';
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 text-white font-medium">{h}</td>
                        <td className="py-2 px-3 text-white/50 max-w-xs truncate">{sampleVal}</td>
                        <td className="py-2 px-3">
                          {mapped ? <Badge variant="neon" className="mr-2">{mapped}</Badge> : null}
                          <select
                            value={mapped}
                            onChange={(e) => setData('mapping', { ...data.mapping, [idx]: e.target.value })}
                            className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm"
                          >
                            {knownFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sample data */}
            <div>
              <h3 className="text-white/60 text-sm mb-2">Contoh Data (5 baris pertama)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-white/10">
                  <thead>
                    <tr className="bg-white/5">
                      {headers.map((h, i) => <th key={i} className="py-1 px-2 text-left text-white/50 whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-white/5">
                        {row.map((cell, j) => <td key={j} className="py-1 px-2 text-white/70 whitespace-nowrap">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={processing}>{processing ? 'Memproses...' : 'Proses Data'}</Button>
              <Button variant="ghost" onClick={() => history.back()}>Kembali</Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
