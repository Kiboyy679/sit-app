import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';

export default function Aliases({ aliases, users }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '', alias: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('aliases.store'), { onSuccess: () => reset() });
  };

  return (
    <AppLayout>
      <Head title="Alias Pengguna" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Alias Nama Karyawan</h1>
          <p className="text-on-surface-variant text-sm">Digunakan untuk pencocokan nama saat impor CSV</p>
        </div>

        <GlassCard title="Tambah Alias">
          <form onSubmit={submit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-on-surface-variant mb-1">Karyawan</label>
              <select value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface">
                <option value="">Pilih karyawan</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.user_id && <p className="text-xs text-error mt-1">{errors.user_id}</p>}
            </div>
            <div className="flex-1">
              <Input label="Alias" value={data.alias} onChange={(e) => setData('alias', e.target.value)} error={errors.alias} placeholder="e.g. RinaS" required />
            </div>
            <Button type="submit" disabled={processing}>Tambah</Button>
          </form>
        </GlassCard>

        <GlassCard title={`Daftar Alias (${aliases.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Alias</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {aliases.map((alias) => (
                  <tr key={alias.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                    <td className="py-3 px-4 text-on-surface">{alias.user?.name}</td>
                    <td className="py-3 px-4 text-primary font-mono">{alias.alias}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => router.delete(route('aliases.destroy', alias.id), { preserveScroll: true })} className="text-error hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
