import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';

export default function ImportIndex({ batches }) {
  const { data, setData, post, processing, errors } = useForm({ csv_file: null });
  const [dragOver, setDragOver] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!data.csv_file) return;
    post(route('import.upload'), { forceFormData: true });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setData('csv_file', file);
  };

  return (
    <AppLayout>
      <Head title="Import CSV" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Import Data CSV</h1>
          <p className="text-on-surface-variant text-sm">Unggah file CSV untuk impor data dalam jumlah besar</p>
        </div>

        {/* Upload */}
        <GlassCard title="Upload File CSV">
          <form onSubmit={submit} className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-outline-variant'
              }`}
              onClick={() => document.getElementById('csv-input').click()}
            >
              <input id="csv-input" type="file" accept=".csv,text/csv" onChange={(e) => setData('csv_file', e.target.files[0])} className="hidden" />
              <div className="text-4xl mb-3">📄</div>
              {data.csv_file ? (
                <div>
                  <p className="text-primary">{data.csv_file.name}</p>
                  <p className="text-xs text-on-surface-variant/70">{(data.csv_file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-on-surface-variant">Seret & lepas file CSV, atau <span className="text-primary">klik untuk memilih</span></p>
                  <p className="text-xs text-on-surface-variant/50 mt-1">Maks 10MB — Format .csv atau .txt</p>
                </div>
              )}
            </div>
            {errors.csv_file && <p className="text-sm text-error">{errors.csv_file}</p>}
            <Button type="submit" disabled={processing || !data.csv_file}>
              {processing ? 'Mengunggah...' : 'Upload & Proses'}
            </Button>
          </form>
        </GlassCard>

        {/* Recent batches */}
        {batches.data.length > 0 && (
          <GlassCard title="Riwayat Import">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">File</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Valid</th>
                    <th className="py-3 px-3">Anomali</th>
                    <th className="py-3 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.data.map((b, i) => (
                    <tr key={b.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                      <td className="py-3 px-3 text-on-surface-variant/70">{i + 1}</td>
                      <td className="py-3 px-3 text-on-surface">{b.file_name}</td>
                      <td className="py-3 px-3 capitalize text-on-surface-variant">{b.status}</td>
                      <td className="py-3 px-3 text-on-surface-variant">{b.total_rows}</td>
                      <td className="py-3 px-3 text-on-surface-variant">{b.valid_rows || '-'}</td>
                      <td className="py-3 px-3 text-on-surface-variant">{b.anomaly_count || 0}</td>
                      <td className="py-3 px-3">
                        {b.status === 'committed' && (
                          <button onClick={() => router.delete(route('import.destroy', b.id))} className="text-error hover:underline text-xs">Hapus</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
