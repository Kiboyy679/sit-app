# Design Document – SIT‑APP (Glass + Clay Morphism)

**Goal** – Antarmuka modern yang menggabungkan **Glassmorphism** (kaca buram, blur, transparan) dengan **Claymorphism** (efek 3D lembut, bayangan ganda, sudut membulat lembut) agar tampak *tactile* dan premium. **Tema utama = Light**, dengan **mode Dark** sebagai opsi. Palette khas perusahaan tetap dipakai (accent hijau `#6bfb9a` dan pink `#f9a8d4`), serta tetap memenuhi kontras WCAG 2.2 AA.

**Signature element:** setiap kartu/heading memakai *dual‑shadow* khas clay + border glass, yang membuat elemen "terangkat" dari latar belakang yang punya **gradient background** (bukan warna polos).

---

## 1. Theme & Color System

SIT‑APP mendukung **dua tema**: **Light (default)** dan **Dark (opsional / toggle)**. Seluruh komponen memakai **CSS variables** sehingga tema bisa berpindah tanpa mengubah markup, cukup menimpa nilai variable di `:root` / `[data-theme="dark"]`.

### 1.1 Light Theme (Default)

| Token | Value | Usage |
|-------|-------|-------|
| **Background** | `#F7F8FA` | Latar halaman (gradient, lihat §1.3) |
| **Card (Clay)** | `#FFFFFF` | Permukaan kartu muda |
| **Text Primary** | `#1A1B1E` | Judul & teks utama |
| **Text Secondary** | `#5F6368` | Keterangan / label |
| **Accent (Green)** | `#22C55E` | Tombol aksi, badge aktif, fokus |
| **Accent (Pink)** | `#F472B6` | Penanda sekunder, chart, ikon aktif alternatif |
| **Muted** | `#ECEFF3` | Latar input, chip, placeholder |
| **Border (Glass)** | `rgba(255,255,255,0.7)` | Border kartu glass di atas gradient |
| **Shadow‑Clay** | `0 6px 14px rgba(31,41,55,0.08), 0 2px 4px rgba(31,41,55,0.08)` | Bayangan dasar kartu clay |
| **Shadow‑Clay‑Press** | `0 2px 4px rgba(31,41,55,0.06), inset 0 1px 2px rgba(31,41,55,0.06)` | Saat kartu/button ditekan |

### 1.2 Dark Theme (Optional)

| Token | Value | Usage |
|-------|-------|-------|
| **Background** | `#131313` | Latar halaman gelap |
| **Card (Clay)** | `#1E1E20` | Permukaan kartu muda (gelap) |
| **Text Primary** | `#F4F5F6` | Judul & teks utama |
| **Text Secondary** | `#A3A6AA` | Keterangan / label |
| **Accent (Green)** | `#6BFB9A` | Tombol aksi, badge aktif, fokus |
| **Accent (Pink)** | `#F9A8D4` | Penanda sekunder, chart, ikon aktif alternatif |
| **Muted** | `#2A2A2D` | Latar input, chip, placeholder |
| **Border (Glass)** | `rgba(255,255,255,0.12)` | Border kartu glass di atas gradient gelap |
| **Shadow‑Clay** | `0 6px 16px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)` | Bayangan dasar kartu clay |
| **Shadow‑Clay‑Press** | `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(0,0,0,0.5)` | Saat kartu/button ditekan |

### 1.3 Background Gradient (kunci look Glass+Clay)

Kesan "glass" baru terasa jika ada **gradient berwarna** di belakang kartu. Karena itu **background halaman selalu berupa gradient**, bukan warna datar.

- **Light:** `linear-gradient(135deg, #E8F5E9 0%, #FCE7F3 45%, #DBEAFE 100%)` — soft pastel (hijau muda → pink muda → biru muda).
- **Dark:** `linear-gradient(135deg, #0F1B14 0%, #1D1220 45%, #0B1420 100%)` — hijau tua → ungu tua → biru tua.

```css
body { background: linear-gradient(135deg, #E8F5E9 0%, #FCE7F3 45%, #DBEAFE 100%); }
[data-theme="dark"] body { background: linear-gradient(135deg, #0F1B14 0%, #1D1220 45%, #0B1420 100%); }
```

---

## 2. Glass vs Clay – Kapan Memakai Mana

| Elemen | Gaya | Alasan |
|--------|------|--------|
| **Card utama / konten besar** | **Clay** (`box-shadow` ganda + radius besar) | Memberi kedalaman "terangkat", mudah dibaca |
| **Sidebar / BottomNav / Header** | **Glass** (`backdrop-blur` + border putih tipis) | Elemen navigasi *float* di atas konten, blur konten di belakangnya |
| **Modal / Dialog** | **Glass** di atas `backdrop blur` overlay | Membuat modal terasa "di depan" layar |
| **Badge / Chip / StatCard** | **Hybrid** – body clay flat + aksen glass | Statistik menonjol tapi tetap ringan |
| **Input / Form field** | **Muted flat** (`#ECEFF3`) + focus clay | Bidang input harus jelas terbaca, bukan buram |

**Aturan emas:** *Glass untuk lapisan yang mengambang di atas konten, Clay untuk elemen yang menopang konten.* Jangan kedua‑duanya dipakai di satu elemen agar tidak bingung.

---

## 3. Typography

| Role | Font‑Family | Size | Weight | Line‑Height |
|------|-------------|------|--------|------------|
| **Display / H1** | `Plus Jakarta Sans` | 28 px | 700 | 1.15 |
| **Heading / H2‑H3** | `Plus Jakarta Sans` | 20 px / 18 px | 700 | 1.2 |
| **Body** | `Inter` | 14 px | 400 | 1.5 |
| **Caption / Small** | `Inter` | 12 px | 400 | 1.4 |
| **Data / Code** | `Fira Code` (fallback `monospace`) | 13 px | 400 | 1.5 |

> **Kenapa Plus Jakarta Sans?** Referensi UMKMCipadung memakai font sans yang hangat & modern. Plus Jakarta Sans memberi karakter display yang ramah (cocok dengan clay) sementara Inter menjaga keterbacaan body.

---

## 4. Core Components (React + TailwindCSS)

Semua komponen memakai **CSS variables** + Tailwind. Class custom:

```css
/* CLAY – permukaan, dual shadow */
.clay { background: var(--card); border-radius: 20px; box-shadow: var(--shadow-clay); }
.clay-press { box-shadow: var(--shadow-clay-press); transform: translateY(1px); }

/* GLASS – float, blur */
.glass { background: rgba(255,255,255,0.55); backdrop-filter: blur(14px); border: 1px solid var(--border-glass); }
[data-theme="dark"] .glass { background: rgba(255,255,255,0.06); }

/* ACCENT */
.text-accent { color: var(--accent); }
```

| Component | Props / Desc | Class |
|-----------|--------------|-------|
| **ClayCard** | `title?`, `children`, `footerAction?`, `onClick?` | `.clay` |
| **GlassPanel** | `children`, `fullWidth?` (sidebar/nav/modal) | `.glass` |
| **StatCard** | `label`, `value`, `icon`, `accent?` (`green`/`pink`) | `.clay` + icon accent |
| **Sidebar** (desktop) | `menuItems[{icon,label,route,roles}]`, `collapsed`, `themeToggle` | `.glass` fixed left |
| **BottomNav** (mobile) | `items[{icon,label,route,active}]`, `onSelect` | `.glass` floating pill |
| **Button** | `variant` (`primary`,`secondary`,`ghost`,`danger`), `disabled`, `loading` | primary = `--accent` + `.clay-press` on hover |
| **Input** | `label?`, `type`, `error?`, `placeholder` | muted flat, focus ring accent |
| **Modal** | `isOpen`, `onClose`, `title`, `children` | `.glass` + backdrop blur overlay |
| **Badge** | `status` (`approved`,`pending`,`rejected`,`duplicate`,`sakit`,`izin`,`hadir`,`alfa`) | pill, accent‑tinted bg |
| **Toast** | `type` (`success`,`error`,`warning`,`info`), `message` | `.clay` + accent left border |
| **ProgressBar** | `percent`, `color?`, `label?` | track muted, fill accent (rounded) |
| **Toggle (Theme)** | `checked`, `onChange`, `label` | pill switch, `--accent` knob |

**Hover / Press behavior (clay):**
```css
.clay { transition: transform .18s ease, box-shadow .18s ease; }
.clay:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(31,41,55,0.12); }
.clay:active { transform: translateY(1px); box-shadow: var(--shadow-clay-press); }
```

---

## 5. Responsiveness & Layout

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | ≤ 640 px | BottomNav (floating pill), sidebar tersembunyi, konten full‑width |
| **Tablet** | 641‑1024 px | Sidebar collapse ke ikon‑only (80 px), BottomNav tetap |
| **Desktop** | > 1024 px | Sidebar penuh (240 px), BottomNav tersembunyi |

### 5.1 Wireframes per Halaman

#### 5.1.1 Login
```
+------------------------------------------+
|              [Logo SIT-APP]               |
|   (background gradient pastel)            |
|  ┌──────────── ClayCard (380px) ──────┐  |
|  │  Selamat Datang 👋                  │  |
|  │  [Email]  [Password]                │  |
|  │  [Masuk]            [Lupa?]         │  |
|  │  ── atau masuk dengan ──           │  |
|  │  [  Google  ] [  SSO  ]             │  |
|  └─────────────────────────────────────┘  |
|              © 2026 SIT‑APP                |
+------------------------------------------+
```

#### 5.1.2 Dashboard (Karyawan)
```
+──────────────────────────────────────────────────────+
|  Glass Header: [☰] Logo        [🌞/🌙] [Avatar]      |
+──────────────┬───────────────────────────────────────+
| Sidebar(.glass)| Main Area                          |
|  • Beranda     | Header: "Halo, Andi 👋"            |
|  • Arsip       | ┌ Stats row (ClayCard) ──────────┐ |
|  • Laporan FYP | │ [Total] [Penayangan] [FYP][Izin]│ |
|  • Izin        | └─────────────────────────────────┘ |
|  • Kehadiran   | ┌ Recent Activity ───────────────┐ |
|  • Profil      | │ ClayCards list (konten/laporan) │ |
|                | └─────────────────────────────────┘ |
+──────────────┴───────────────────────────────────────+
```

#### 5.1.3 Arsip Konten
```
+────────────────────────────────────────────────--+
| Filters (pip) [Tema] [Tanggal] [Jenis]  [Upload FAB] |
+────────────────────────────────────────────────--+
| Grid ClayCards (3‑col desktop / 2‑col tablet)    |
| ┌─────────┐ ┌─────────┐ ┌─────────┐             |
| │Thumbnail│ │Thumbnail│ │Thumbnail│             |
| │ Title   │ │ Title   │ │ Title   │             |
| └─────────┘ └─────────┘ └─────────┘             |
+────────────────────────────────────────────────--+
```
- Hover kartu: `translateY(-2px)` + overlay aksi (Download/Delete).
- Mode batch: pilih banyak kartu → top‑bar aksi muncul.

#### 5.1.4 Laporan FYP
```
+────────────────────────────────────────────────--+
| [＋ Lapor FYP]            [Search]               |
+────────────────────────────────────────────────--+
| List ClayCards dengan Badge status                |
| ┌──────────────────────────────────────────────┐ |
| │ [🌐 TikTok]  Judul           [Approve][Reject]│ |
| │  link-url.com  jangkauan · interaksi          │ |
| └──────────────────────────────────────────────┘ |
+────────────────────────────────────────────────--+
```
- Submit URL → **duplikasi check** → Toast (sukses/duplikat).

#### 5.1.5 Izin
```
+────────────────────────────────────────────────--+
| [＋ Ajukan Izin]                                  |
+────────────────────────────────────────────────--+
| Form (ClayCard): mulai · selesai · jenis · ket    |
|                    [bukti upload bila sakit]      |
+────────────────────────────────────────────────--+
| Daftar permintaanku:  ClayCard + Badge + [Batal]  |
+────────────────────────────────────────────────--+
```

#### 5.1.6 Kehadiran (Admin)
```
+────────────────────────────────────────────────--+
|  Header: Bulan [‹ 2026‑08 ›]   [Export CSV]      |
+────────────────────────────────────────────────--+
|  Kisi tabel: rows=karyawan, cols= tanggal          |
|  cell = badge (H/I/S/A) + chip (Terlambat/Lembur) |
|  Bulk edit → pilih cell → dropdown ubah status    |
+────────────────────────────────────────────────--+
```

#### 5.1.7 Super‑Admin Dashboard (Tabs)
- **Kinerja** – line chart (accent green, pink untuk seri kedua).
- **Impor** – UI Import CSV + ringkasan global.
- **Audit** – daftar log (glass rows) + filter.
- **Arsip** – kartu arsip mingguan + verifikasi checksum.

---

## 6. Interaction Details (Edge Cases)

| Interaction | Detail |
|------------|--------|
| **Theme Toggle** | Persist ke `localStorage` (`sitapp-theme`) + hormati `prefers-color-scheme`. Default = **light**. |
| **Form Draft Save** | Simpan draft ke `localStorage` tiap 5 dtk; restore saat mount. |
| **URL Normalisation** | On blur panggil `/api/normalize-url`. Gagal → inline error “Tidak dapat mengurai tautan”. |
| **Duplicate FYP** | API `{duplicate:true,date,user}` → toast “Duplikat! Sudah diajukan 20 Agu oleh Andi”. Disable submit. |
| **Import CSV** | Progress bar per 100 baris; baris error → [Coba Lagi]; setelah 3× gagal auto *Manual Review*. |
| **Logout** | Clear token + `localStorage`, redirect `/login`. |
| **Accessibility** | Modal trap focus, ESC tutup, `aria-label` ikon, skip‑link. |
| **Reduced Motion** | Hormati `prefers-reduced-motion`: matikan lift hover & underline animasi. |

---

## 7. Signature Element – Neon Underline + Clay Lift

Paduan dua momen:
1. **Neon underline** di heading (animasi, `IntersectionObserver`).
2. **Clay lift** di kartu (hover `translateY(-2px)` + shadow membesar).

```css
.heading { position: relative; display: inline-block; }
.heading::after {
  content:''; position:absolute; left:0; bottom:-6px;
  width:0; height:3px; border-radius:9999px;
  background: var(--accent); transition: width .45s ease;
}
.heading.in-view::after { width:100%; }

@media (prefers-reduced-motion: reduce) {
  .heading::after { transition: none; }
  .clay:hover { transform: none; }
}
```

---

## 8. Bottom Navigation (Mobile) – Floating Glass Pill

> **Source reference:** `resources/js/components/ui/bottomnavigation.tsx` (UMKMCipadung) — floating pill `rounded-[28px]`, `backdrop-blur-2xl`, gradient glass.

### 8.1 Struktur & Spesifikasi

| Property | Value |
|----------|-------|
| **Position** | `fixed bottom-0 left-1/2 -translate-x-1/2 z-50` |
| **Max width** | `480px` (pusat di layar lebar) |
| **Safe area** | `pb-safe` → `padding-bottom: env(safe-area-inset-bottom, 0px)` |
| **Margin luar** | `px-4 pb-4` (16px) → pill melayang, tidak menempel tepi |
| **Radius** | `28px` (pill) |
| **Backdrop** | `backdrop-blur-2xl` |
| **Border** | `border border-white/50 ring-1 ring-white/30` (light) / `border-white/15 ring-white/10` (dark) |
| **Background** | **Light:** `bg-white/70` gradient glass → **Dark:** `bg-white/10` |
| **Shadow** | `0 8px 32px rgba(31,41,55,0.18)` (light) / `0 8px 32px rgba(0,0,0,0.6)` (dark) |
| **Ikona** | Lucide/Feather 24px, stroke 2.5 |
| **Label** | 10px, weight 500 |
| **Aktif** | bg accent tint + icon/label `text-[--accent]` |

### 8.2 Items (SIT‑APP)

| ID | Label | Icon | Route |
|----|-------|------|-------|
| `beranda` | Beranda | `Home` | `/dashboard` |
| `arsip` | Upload | `UploadCloud` | `/arsip-konten` |
| `fyp` | FYP | `TrendingUp` | `/laporan-fyp` |
| `izin` | Izin | `CalendarClock` | `/izin` |

### 8.3 Implementation (versi SIT‑APP)

```tsx
// BottomNav.tsx — floating glass pill, theme‑aware
import { Home, UploadCloud, TrendingUp, CalendarClock } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

const items = [
  { id:'beranda', label:'Beranda', icon:Home, href:'/dashboard' },
  { id:'arsip',   label:'Upload',  icon:UploadCloud, href:'/arsip-konten' },
  { id:'fyp',     label:'FYP',     icon:TrendingUp, href:'/laporan-fyp' },
  { id:'izin',    label:'Izin',    icon:CalendarClock, href:'/izin' },
];

export function BottomNav({ activeTab }: { activeTab: string }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 pb-safe md:hidden">
      <div className="px-4 pb-4">
        <div className="
          backdrop-blur-2xl
          bg-white/70 dark:bg-white/10
          rounded-[28px]
          border border-white/60 dark:border-white/15
          ring-1 ring-white/40 dark:ring-white/10
          shadow-[0_8px_32px_rgba(31,41,55,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
        ">
          <div className="flex items-center justify-around px-2 py-3">
            {items.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link key={tab.id} href={tab.href} preserveScroll
                  className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-colors
                    ${active ? 'bg-[#22C55E]/15 dark:bg-[#6BFB9A]/15' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <Icon size={24} strokeWidth={2.5}
                    className={active ? 'text-[#22C55E] dark:text-[#6BFB9A]' : 'text-slate-500 dark:text-slate-400'} />
                  <span className={`text-[10px] font-medium
                    ${active ? 'text-[#22C55E] dark:text-[#6BFB9A]' : 'text-slate-500 dark:text-slate-400'}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

> Catatan: dipakai cukup dengan `#22C55E` (light) & `#6BFB9A` (dark) agar kontras terpenuhi — `#6BFB9A` (hijau muda) di latar terang kontrasnya rendah, karena itu light memakai hijau lebih gelap.

---

## 9. Accessibility Checklist (WCAG 2.2 AA)

- Kontras teks ≥ 4.5:1 & elemen ≥ 3:1 (verifikasi Lighthouse di dua tema).
- Focus ring (`ring-2 ring-[--accent]`) terlihat di semua interaktif.
- `aria-label` pada ikon‑saja (BottomNav, ikon aksi).
- `role="alert"` pada Toast.
- Urutan Tab mengikuti urutan visual; `Esc` menutup dialog.
- Skip‑link `#main`.
- Dukungan `prefers-reduced-motion`.
- `aria-pressed` / role switch pada theme toggle.

---

## 10. Development Roadmap

| Sprint | Deliverable |
|-------|-------------|
| **S1** | Tailwind config (clay/glass utilities), token dua tema, `ClayCard`+`GlassPanel`, layout global (Sidebar/BottomNav). |
| **S2** | Theme toggle + persist, Login, auth flow, routing per‑role. |
| **S3** | Arsip Konten UI (grid, filter, upload FAB). |
| **S4** | FYP UI (modal, duplikasi check, badge). |
| **S5** | Izin & Kehadiran UI (form, kisi tabel). |
| **S6** | Import CSV UI, background resolver, panel anomali. |
| **S7** | Super‑Admin Dashboard (tabs, chart, audit, arsip). |
| **S8** | Polish – responsif, audit aksesibilitas 2 tema, hand‑off ke **Stitch AI**. |

---

## 11. Asset Sources
- **Icons** – Lucide (Feather fork), MIT.
- **Fonts** – Plus Jakarta Sans & Inter (Google Fonts).
- **Bahan visual** – gradient dibuat via CSS murni (tanpa gambar) agar ringan.

---

*Dokumen siap di‑export ke Figma (frame per komponen) dan hand‑off ke **Stitch AI** tanpa ambiguitas. Seluruh nilai warna disediakan untuk tema Light & Dark.*
