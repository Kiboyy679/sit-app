import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

export default function Users({ users, roles }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '', email: '', password: '', password_confirmation: '', unit: '', role: 'karyawan',
  });

  const roleColors = { super_admin: 'danger', admin_konten: 'info', admin_fyp: 'neon', admin_absensi: 'warning', karyawan: 'default' };

  const submit = (e) => {
    e.preventDefault();
    if (editing) {
      put(route('users.update', editing.id), { onSuccess: () => { setEditing(null); reset(); } });
    } else {
      post(route('users.store'), { onSuccess: () => { setShowForm(false); reset(); } });
    }
  };

  const startEdit = (user) => {
    setEditing(user);
    setData({ name: user.name, email: user.email, password: '', password_confirmation: '', unit: user.unit || '', role: user.roles?.[0] || 'karyawan' });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <Head title="Pengguna" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pengelolaan Pengguna</h1>
            <p className="text-white/50 text-sm">{users.length} pengguna terdaftar</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); }}>
            {showForm ? 'Tutup' : '+ Tambah Pengguna'}
          </Button>
        </div>

        {showForm && (
          <GlassCard title={editing ? 'Edit Pengguna' : 'Tambah Pengguna'}>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
              <Input label="Surel" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
              {!editing && (
                <>
                  <Input label="Kata Sandi" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} required />
                  <Input label="Ulangi Kata Sandi" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                </>
              )}
              <Input label="Unit Kerja" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
              <div>
                <label className="block text-sm text-white/60 mb-1">Peran</label>
                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white">
                  {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={processing}>{editing ? 'Simpan' : 'Tambah'}</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Surel</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-white/60">{user.email}</td>
                    <td className="py-3 px-4 text-white/60">{user.unit || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={roleColors[user.roles?.[0]] || 'default'}>{user.roles?.[0] || '-'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => startEdit(user)} className="text-[#6bfb9a] hover:underline text-xs mr-2">Edit</button>
                      <button onClick={() => router.put(route('users.update', user.id), { is_active: !user.is_active }, { preserveScroll: true })} className="text-yellow-400 hover:underline text-xs">
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
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
