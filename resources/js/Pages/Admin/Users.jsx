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

  // Extract role name safely — roles may be objects or strings
  const getRoleName = (user) => {
    const r = user.roles?.[0];
    if (!r) return 'karyawan';
    return typeof r === 'string' ? r : r.name || 'karyawan';
  };

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
    setData({ name: user.name, email: user.email, password: '', password_confirmation: '', unit: user.unit || '', role: getRoleName(user) });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <Head title="Pengguna" />
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Pengelolaan Pengguna</h1>
            <p className="text-on-surface-variant text-sm">{users.length} pengguna terdaftar</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); }} className="w-full sm:w-auto justify-center">
            {showForm ? 'Tutup' : '+ Tambah Pengguna'}
          </Button>
        </div>

        {showForm && (
          <GlassCard title={editing ? 'Edit Pengguna' : 'Tambah Pengguna'}>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-1">Peran</label>
                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none">
                  {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={processing}>{editing ? 'Simpan' : 'Tambah'}</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Desktop table */}
        <GlassCard>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Surel</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleName = getRoleName(user);
                  return (
                    <tr key={user.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                      <td className="py-3 px-4 text-on-surface font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{user.email}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{user.unit || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={roleColors[roleName] || 'default'}>{roleName}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(user)} className="text-primary hover:underline text-xs font-semibold">Edit</button>
                          <button type="button" onClick={() => router.put(route('users.update', user.id), { is_active: !user.is_active }, { preserveScroll: true })} className="text-yellow-600 hover:underline text-xs font-semibold">
                            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((user) => {
              const roleName = getRoleName(user);
              return (
                <div key={user.id} className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface">{user.name}</span>
                    <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={roleColors[roleName] || 'default'}>{roleName}</Badge>
                    <span className="text-on-surface-variant">{user.unit || '-'}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(user)}>Edit</Button>
                    <Button size="sm" variant={user.is_active ? 'danger' : 'secondary'} onClick={() => router.put(route('users.update', user.id), { is_active: !user.is_active }, { preserveScroll: true })}>
                      {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
