# Product Requirements Document (PRD) – SIT‑APP

**Project:** Sistem Pemantauan Kinerja Karyawan (SIT‑APP)
**Version:** 1.0 – 31 Agustus 2026
**Owner:** Rizkia Nuari Fujiana (majan)
**Tech Stack:** Laravel 11 (backend) + React 18 (frontend) + PostgreSQL 15 (database)

---

## 1. Product Overview

### Vision
Membangun sistem internal yang memantau, melaporkan, dan menganalisis kinerja konten media sosial karyawan secara otomatis, sehingga manajemen dapat mengambil keputusan berbasis data real‑time.

### Target Users
| Role | Description |
|------|-------------|
| **Karyawan** | Mengunggah konten, melaporkan FYP, mengajukan izin, mengisi kehadiran. |
| **Admin Konten** | Mengelola arsip konten, standar tema, mengunduh materi massal. |
| **Admin FYP** | Meninjau & menyetujui/menolak laporan FYP. |
| **Admin Absensi** | Mencatat kehadiran, menyetujui izin. |
| **Super Admin** | Kelola pengguna, impor CSV, laporan kinerja, audit, arsip. |

### Business Objectives
- Mempercepat proses pelaporan kinerja konten (target ≤ 2 menit). 
- Menurunkan duplikasi konten hingga 90 % melalui deteksi otomatis.
- Menyediakan laporan kinerja bulanan yang dapat diekspor (CSV/Excel).
- Menjamin audit trail yang tidak dapat diubah (kompliance internal).

### Success Metrics
- **Adoption:** ≥ 80 % aktif karyawan menggunakan modul FYP dalam 3 bulan.
- **Duplication Reduction:** ≤ 5 % laporan duplikat terdeteksi.
- **Uptime:** 99 % sistem tersedia per bulan.
- **Performance:** 95 % halaman utama dimuat < 2 detik.

---

## 2. User Personas

### Persona 1 – Karyawan (marketing specialist)
- **Demografi:** 25‑35 th, menggunakan media sosial secara intensif.
- **Goals:** Melaporkan FYP dengan cepat, mengarsipkan materi kreatif, mengajukan izin.
- **Pain Points:** Proses manual laporan, duplikasi konten, tidak ada visibilitas kinerja.

### Persona 2 – Admin FYP
- **Demografi:** 30‑45 th, bertanggung jawab menilai kualitas konten.
- **Goals:** Meninjau laporan, mendeteksi duplikasi, memberi umpan balik.
- **Pain Points:** Banyak laporan, sulit menelusuri duplikasi lintas karyawan.

### Persona 3 – Super Admin
- **Demografi:** 35‑50 th, IT & HR manager.
- **Goals:** Mengelola data, menghasilkan laporan kinerja, memastikan keamanan data.
- **Pain Points:** Integrasi data CSV, audit compliance, backup.

---

## 3. Feature Requirements (Tabular)
| Feature | Description | User Stories | Priority | Acceptance Criteria |
|---------|-------------|--------------|----------|---------------------|
| **AUTH‑01** | Login email+password, tanpa self‑register. | *Sebagai* karyawan, *saya* dapat masuk dengan email & password. | Must | Login berhasil, token JWT disimpan, error bahasa Indonesia. |
| **AUTH‑02** | Hash password (bcrypt, min‑8 char). | *Sebagai* admin, *saya* dapat mereset password pengguna. | Must | Password disimpan hashed, validasi panjang. |
| **KNT‑01** | Upload konten (gambar/video) max 10 file per pengiriman, ukuran gambar ≤ 5 MB, video ≤ 50 MB. | *Sebagai* karyawan, *saya* mengunggah materi kreatif. | Must | File diterima, thumbnail otomatis, kompres ke WebP ≤ 1600 px. |
| **KNT‑02** | Normalisasi tema otomatis (lowercase, trim, alfanumerik). | *Sebagai* karyawan, *saya* menulis tema bebas. | Must | Tema disimpan canonical, saran tema muncul. |
| **FYP‑01** | Form multi‑blok (max 10 blok) untuk laporan FYP. | *Sebagai* karyawan, *saya* melaporkan beberapa FYP sekaligus. | Must | Semua blok disimpan, validasi masing‑masing. |
| **FYP‑02** | Deteksi platform otomatis dari URL, normalisasi tautan (BR‑20‑26). | *Sebagai* sistem, *saya* mengidentifikasi platform (TikTok, YouTube, dll.). | Must | Platform ditampilkan label read‑only, tautan kanonik disimpan. |
| **FYP‑03** | Duplikasi detection 3‑level (BR‑27‑30). | *Sebagai* admin, *saya* menolak duplikat. | Must | Duplicate rejected dengan pesan tanggal/ pengguna. |
| **IZN‑01** | Ajukan izin, bukti wajib untuk sakit. | *Sebagai* karyawan, *saya* mengajukan izin sakit dengan bukti. | Must | Form menolak tanpa bukti, tanggal tidak tumpang tindih. |
| **ABS‑01** | Kisi kehadiran, status utama + penanda tambahan terpisah. | *Sebagai* admin absensi, *saya* menandai terlambat & lembur. | Must | Kedua penanda tersimpan bersamaan. |
| **IMP‑01** | Import CSV, tolak bila hash berkas sama. | *Sebagai* super admin, *saya* mengunggah CSV pertama kali. | Must | File ditolak jika hash sudah ada. |
| **IMP‑02** | Auto‑detect kolom, simpan mapping untuk batch selanjutnya. | *Sebagai* super admin, *sanya* mengonfirmasi mapping. | Must | Mapping disimpan dan dapat dipilih kembali. |
| **IMP‑03** | Background resolve share‑link → kanonik (max 5 hop, 10 s timeout). | *Sebagai* sistem, *saya* mengurai tautan share‑link. | Must | Hasil ter‑cache di `url_resolutions`. |
| **IMP‑04** | Penanda anomali (BR‑40) – 9 tipe. | *Sebagai* super admin, *saya* melihat baris bermasalah. | Must | Semua penanda muncul pada UI review. |
| **DSB‑01** | Dashboard per peran (karyawan, admin konten, admin FYP, admin absensi, super admin). | *Sebagai* pengguna, *saya* melihat data relevan saja. | Must | Menu tidak menampilkan item yang tidak diakses. |
| **ARS‑01** | Pengarsipan mingguan, paket berisi materi + checksum script. | *Sebagai* admin konten, *saya* mengarsipkan materi mingguan. | Must | Paket dapat diunduh, file asli di‑hapus hanya setelah verifikasi checksum. |
| **AUD‑01** | Audit log immutabel, filterable (pelaku, tipe, rentang waktu). | *Sebagai* super admin, *saya* menelusuri jejak audit. | Must | Tidak ada edit/delete log. |

---

## 4. Non‑Functional Requirements
| Category | Requirement |
|----------|-------------|
| **Performance** | 95 % permintaan selesai < 2 detik, 20 concurrent users minimal. |
| **Scalability** | Dapat menambah user hingga 500 tanpa redeploy. |
| **Security** | HTTPS‑only, Helmet, Rate‑limit 100 req/15 menit, CSRF & XSS protection, password hashing, least‑privilege DB user. |
| **Reliability** | Backup DB harian, recovery script, uptime 99 % per bulan. |
| **Maintainability** | Codebase terstruktur: Laravel API + React SPA, CI/CD GitHub Actions, linting, unit & integration tests. |
| **Usability** | UI glassmorphism, responsif, error messages bahasa Indonesia, draft auto‑save pada form. |
| **Compliance** | Audit log immutable, tidak ada data pribadi di repo, .gitignore menghalangi `AGENTS.md` dll. |

---

## 5. User Flows (High‑Level)
1. **Login → Dashboard** – Auth guard → role‑based navigation.
2. **Karyawan → Upload Arsip** – Pilih tema → pilih berkas → async upload → progress bar → submit → toast success.
3. **Karyawan → Laporkan FYP** – Add block → isi URL → sistem normalisasi & preview → duplikat check → submit.
4. **Admin FYP → Review Queue** – Filter duplikat → approve/reject dengan alasan.
5. **Admin Absensi → Isi Kehadiran** – Grid → klik sel → pilih status & penanda → save.
6. **Super Admin → Import CSV** – Upload → mapping auto → preview → resolve share‑link (background) → review anomali → commit.
7. **Super Admin → Generate Laporan Kinerja** – Pilih periode → view KPI → export CSV/Excel.
8. **Super Admin → Arsip Mingguan** – Scheduler → paket → checksum script → verifikasi → hapus sumber.

---

## 6. Release Plan & Timeline
| Milestone | Scope | Estimated Duration |
|-----------|-------|--------------------|
| **M1 – Setup & Boilerplate** | Laravel API, React SPA, PostgreSQL, CI/CD. | 2 weeks |
| **M2 – Auth & Role Management** | JWT, multi‑role, UI guard. | 1 week |
| **M3 – Core Modules A (KNT + FYP)** | Upload, tema, preview, duplikat, normalisasi URL. | 3 weeks |
| **M4 – Core Modules B (IZN + ABS)** | Form izin, kehadiran grid, penanda tambahan. | 2 weeks |
| **M5 – Import & Data Cleaning** | CSV upload, background resolver, anomali UI. | 3 weeks |
| **M6 – Dashboard & Reporting** | Role‑based dashboards, export, audit log. | 2 weeks |
| **M7 – Archiving & Final QA** | Weekly archive, checksum script, UAT (22 skenario). | 2 weeks |
| **Launch** | Production deployment (Vercel/PV), monitoring. | – |

---

## 7. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Link resolve rate‑limit / block** | High – import/preview fails. | Use mock domain for dev, cache results, exponential back‑off. |
| **Data loss saat arsip** | Critical – materi terhapus. | Verifikasi checksum sebelum hapus, manual approval. |
| **Duplikasi false‑positive** | Medium – laporan ditolak tidak perlu. | Parameter fuzzy matching, admin override. |
| **Performance degrade >2 s** | Medium – user dissatisfaction. | Index `content_key`, query pagination, caching. |
| **Security breach** | Critical – data internal. | HTTPS, helmet, rate‑limit, audit log, least‑privilege DB.

---

## 8. Open Questions / Decisions Needed
- **Bobot skor kinerja** – finalisasi sebelum tahap 5.
- **Penyimpanan arsip eksternal** – cloud bucket vs. on‑prem NAS.
- **Job queue** – Laravel Horizon vs. simple DB‑based scheduler.

---

*Dokumen ini mengikuti panduan PRD dari https://github.com/cpjet64/vibecoding/blob/main/prd‑guide.md dan menyesuaikannya dengan kebutuhan SIT‑APP.*
