import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('login'));
  };

  return (
    <>
      <Head title="Masuk" />
      <div className="min-h-screen bg-[#131313] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#6bfb9a]">SIT-APP</h1>
            <p className="text-white/40 text-sm mt-1">Sistem Pemantauan Kinerja Karyawan</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Masuk ke Akun</h2>

            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Surel"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                placeholder="email@sit-app.local"
                required
              />
              <Input
                label="Kata Sandi"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
                placeholder="Masukkan kata sandi"
                required
              />
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#6bfb9a]"
                />
                Ingat saya
              </label>
              {errors.general && (
                <p className="text-red-400 text-sm">{errors.general}</p>
              )}
              <Button type="submit" variant="primary" className="w-full" disabled={processing}>
                {processing ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </div>

          <p className="text-center text-white/30 text-xs mt-4">
            &copy; 2026 SIT-APP &middot; Versi 1.0
          </p>
        </div>
      </div>
    </>
  );
}
