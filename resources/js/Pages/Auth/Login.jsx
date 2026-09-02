import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

const DEMO_ACCOUNTS = [
    { role: 'Super Admin', email: 'super@sit-app.local', unit: 'IT', color: 'text-primary' },
    { role: 'Admin Konten', email: 'konten@sit-app.local', unit: 'Konten Kreatif', color: 'text-secondary' },
    { role: 'Admin FYP', email: 'fyp@sit-app.local', unit: 'Social Media', color: 'text-primary' },
    { role: 'Admin Absensi', email: 'absensi@sit-app.local', unit: 'HR', color: 'text-tertiary' },
];

export default function Login() {
    const [showDemo, setShowDemo] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const fillDemo = (email) => {
        setData('email', email);
        setData('password', 'password123');
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Masuk" />

            {/* Ambient background shapes */}
            <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-surface-container opacity-40 blur-[80px] pointer-events-none z-[-1]" />
            <div className="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-surface-container-highest opacity-40 blur-[80px] pointer-events-none z-[-1]" />

            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 z-[-1]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(77,68,227,0.08) 0%, rgba(250,248,255,1) 100%)' }} />

                <main className="w-full max-w-[440px] z-10 relative">
                    <div className="glass-panel rounded-xl p-8 flex flex-col gap-8">
                        {/* Branding Header */}
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-16 h-16 rounded-lg bg-surface-container-low flex items-center justify-center mb-2 shadow-sm border border-outline-variant/30 overflow-hidden">
                                <span className="material-symbols-outlined text-primary text-3xl">shield</span>
                            </div>
                            <h1 className="font-headline-md text-headline-md text-on-surface">SIT-APP</h1>
                            <p className="text-sm text-on-surface-variant">Monitoring Kinerja</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={submit} className="flex flex-col gap-4 w-full">
                            {/* Email Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface" htmlFor="email">
                                    Email Profesional
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" style={{ fontSize: '20px' }}>
                                        mail
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@perusahaan.com"
                                        required
                                        className="w-full h-11 pl-10 pr-4 bg-white border border-outline-variant/50 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm outline-none"
                                    />
                                </div>
                                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface" htmlFor="password">
                                        Kata Sandi
                                    </label>
                                    <a className="text-xs font-semibold text-primary hover:text-primary-container transition-colors" href="#">
                                        Lupa Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" style={{ fontSize: '20px' }}>
                                        lock
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-11 pl-10 pr-10 bg-white border border-outline-variant/50 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Remember */}
                            <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-outline-variant bg-white text-primary focus:ring-primary"
                                />
                                Ingat saya
                            </label>

                            {errors.general && <p className="text-error text-sm">{errors.general}</p>}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full h-11 bg-primary text-on-primary text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-primary/90 hover:shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                                {!processing && (
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="text-center border-t border-outline-variant/30 pt-4">
                            <p className="text-sm text-on-surface-variant/80">
                                Akses terbatas untuk personel terdaftar.
                                <br />Hubungi administrator untuk bantuan.
                            </p>
                        </div>
                    </div>

                    {/* Demo Accounts */}
                    <div className="mt-4 glass-panel rounded-xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowDemo(!showDemo)}
                            className="w-full flex items-center justify-between px-5 py-3 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">key</span>
                                Akun Demo
                            </span>
                            <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>
                        {showDemo && (
                            <div className="px-5 pb-4 space-y-2 border-t border-outline-variant/30 pt-3">
                                {DEMO_ACCOUNTS.map((a) => (
                                    <button
                                        key={a.email}
                                        type="button"
                                        onClick={() => fillDemo(a.email)}
                                        className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/40 transition-all"
                                    >
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold ${a.color}`}>{a.role}</p>
                                            <p className="text-xs text-on-surface-variant truncate">{a.email}</p>
                                        </div>
                                        <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {a.unit}
                                        </span>
                                    </button>
                                ))}
                                <p className="text-[11px] text-on-surface-variant/50 text-center pt-1">
                                    Password semua akun: <code className="text-on-surface-variant/70">password123</code>
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-on-surface-variant/40 text-xs mt-4">
                        &copy; 2026 SIT-APP &middot; Versi 1.0
                    </p>
                </main>
            </div>
        </>
    );
}
