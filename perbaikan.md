# Daftar Perbaikan SIT-APP vs PRD
**Hasil Cross-Check Menyeluruh** — 3 September 2026  
**Kesesuaian Keseluruhan: ~78%**

---

## ✅ MODUL YANG SUDAH LENGKAP (95%+)

| Modul | Fitur PRD | Implementasi |
|-------|-----------|--------------|
| **AUTH** | Login email+password, bcrypt min 8 char, reset password, session 12 jam, rate limit 5/15 menit, deactivate user, multi-role, alias | `UserController`, `LoginRequest`, Spatie Permission |
| **KNT (Arsip Konten)** | Upload multi-file max 10, tema + normalisasi otomatis, tanggal server, async upload progress, view count update, draft auto-save, thumbnail WebP 1600px, duplicate hash 30 hari, max 5 laporan/hari | `ContentController`, `Content/Index.jsx` |
| **FYP (Pelaporan FYP)** | Form single-block (per submit), URL+platform auto-detect, normalisasi URL, duplicate check global/bulan, post_type, engagement≤views, bulk approve/reject, status approval | `FypController`, `Fyp/Index.jsx` |
| **IZN (Izin)** | Form lengkap, bukti wajib sakit, overlap check, approve/reject dgn alasan, auto-create attendance, cancel pending | `LeaveController`, `Leave/Index.jsx` |
| **ABS (Kehadiran)** | Grid bulanan, status default hadir, status utama + flags terpisah (terlambat/lembur/pulang_cepat/pindah_shift), audit log, rekap + export CSV | `AttendanceController`, `Attendance/Index.jsx` |
| **IMP (Import CSV) - Backbone** | Upload CSV, hash anti-duplikat, auto-detect mapping + simpan mapping, periode manual, staging table, background URL resolve (queue), user matching via alias, anomaly flags dasar, review UI, commit + undo, audit trail | `ImportController`, `CsvImportService`, `Import/*` pages, `ResolveUrlJob` |
| **DSB (Dashboard)** | Role-based: karyawan, admin_konten, admin_fyp, admin_absensi, super_admin | `DashboardController`, `Dashboard.jsx` |
| **ARS (Arsip Mingguan) - Core** | Paket arsip + manifest + checksum, download, verify UI, hapus setelah verifikasi, thumbnail & metadata retained | `ArchiveController`, `Archive/*` pages |
| **MST (Data Induk)** | User + unit, alias, identitas (seeded), tema canonical + kandidat | `UserController`, `AliasController`, `ThemeController`, `IdentityController` |
| **AUD (Jejak Audit)** | Immutable logs, filter pelaku/aksi/waktu, cover: FYP, izin, attendance, import, views, file delete | `AuditController`, `AuditLog` model boot() |

---

## ⚠️ GAP DAN PERBAIKAN YANG DIPERLUKAN

### P1 - CRITICAL (Core Business Logic)

#### 1. BR-20 s.d. BR-26: Normalisasi & Penguraian Tautan (Share-link → Kanonik)
**Status: ❌ BELUM LENGKAP**

**PRD Requirements:**
- BR-20: Hapus spasi/karakter tak terlihat, paksa https, hapus awalan www/m/web/mobile
- BR-21: Buang parameter penjejak (utm*, igshid, si, fbclid, _r, _t, is_from_webapp, sender_device, web_id, share_app_id, xmt, rdid, share_url), pertahankan parameter bermakna (v YouTube, lc, comment_id, story_fbid)
- BR-22: Follow redirect max 5 hop, timeout 10 detik
- BR-23: Cache permanen di `url_resolutions` (cross-batch)
- BR-24: Background job, rate limit per domain, tidak di request user
- BR-25: Gagal → flag `UNRESOLVED`, kunci sementara hash URL, retry terjadwal
- BR-26: Ekstrak pengenal kanonik + nama akun → susun `content_key`

**Current Implementation:**
- `FypController::normalizeUrl()` — hanya normalisasi path sederhana per platform
- `CsvImportService` — tidak memakai `ResolveUrlJob` untuk share-link
- `ResolveUrlJob` — ada tapi **tidak di-dispatch** dari import process

**Files to Fix:**
- `app/Services/UrlNormalizationService.php` (NEW — single component shared FYP+Import)
- `app/Jobs/ResolveUrlJob.php` (enhance: BR-20/21/22/23/24/25/26)
- `app/Http/Controllers/FypController.php` (pakai service baru)
- `app/Services/CsvImportService.php` (dispatch job untuk share-link)
- `app/Http/Controllers/ImportController.php` (UI progress resolving)

---

#### 2. BR-45: Klaster Utas (Thread Cluster Detection)
**Status: ❌ BELUM ADA**

**PRD Requirements:**
- Deteksi: 3+ post akun sama ≤5 menit, views identik
- Perlakuan bawaan: 1 klaster = 1 konten, metrik diambil sekali
- Override Super Admin: bisa ubah perlakuan per klaster saat review
- Audit: keputusan klaster tersimpan + alasan

**Current Implementation:** Tidak ada sama sekali.

**Files to Create/Fix:**
- `app/Services/ThreadClusterService.php` (NEW)
- `database/migrations/xxxx_add_cluster_to_fyp_reports.php` (NEW: `cluster_id`, `cluster_decision`, `cluster_reason`)
- `app/Models/FypReport.php` (relasi cluster)
- `app/Http/Controllers/FypController.php` (review cluster)
- `resources/js/Pages/Fyp/Index.jsx` (UI cluster badge + override)

---

#### 3. BR-50 s.d. BR-55: Perhitungan Kinerja & Rekap Identitas
**Status: ⚠️ SEBAGIAN**

**Gaps:**
- `PerformanceController` pakai skor hardcoded (bukan config DB per BR-53)
- `PerformanceFact` model ada tapi **belum di-populate** dari `ImportController::commit()`
- `IdentityRecord` model ada tapi **belum di-build otomatis** dari import (BR-55)
- Bobot skor belum dikonfigurasi (BR-53/54) — butuh tabel `performance_weights`

**Files to Fix:**
- `database/migrations/xxxx_create_performance_weights_table.php` (NEW)
- `app/Models/PerformanceWeight.php` (NEW)
- `app/Services/PerformanceCalculationService.php` (NEW)
- `app/Http/Controllers/ImportController.php` (panggil service setelah commit)
- `app/Http/Controllers/PerformanceController.php` (pakai service + config DB)

---

#### 4. IMP-05 & IMP-10: Background Resolve + Koreksi Anomali
**Status: ❌ BELUM ADA**

**Gaps:**
- `ResolveUrlJob` tidak di-dispatch dari `ImportController::process()`
- UI progress resolving tidak ada di `Import/Review.jsx`
- IMP-10: Koreksi otomatis `PLATFORM_MISMATCH` & `IDENTITY_MISMATCH` berdasarkan parsing URL

**Files to Fix:**
- `app/Http/Controllers/ImportController.php` (dispatch jobs, return job IDs)
- `resources/js/Pages/Import/Review.jsx` (progress indicator resolving)
- `app/Services/CsvImportService.php` (saran koreksi platform/identity)

---

### P2 - HIGH

#### 5. BR-40: Lengkapi 12 Tipe Anomali yang Hilang
**Status: ⚠️ SEBAGIAN (9/21 tipe terdeteksi)**

**Tipe PRD (Lampiran BR-40) vs Implementasi:**

| Kode PRD | Deskripsi | Status |
|----------|-----------|--------|
| DUP_IN_FILE | content_key sama dalam satu berkas | ❌ |
| DUP_ACROSS_BATCH | Sudah ada pada berkas impor sebelumnya | ❌ |
| DUP_CROSS_USER | Satu unggahan diklaim >1 karyawan | ❌ |
| PLATFORM_MISMATCH | Label platform tidak sesuai alamat tautan | ❌ |
| IDENTITY_MISMATCH | Akun pemilik tautan ≠ identitas dilaporkan | ❌ |
| THREAD_SUSPECT | 3+ post akun sama ≤5 menit views identik | ❌ (BR-45) |
| UNMATCHED_USER | Nama tidak cocok karyawan/alias | ❌ |
| NEW_IDENTITY | Identitas belum pernah muncul | ❌ |
| UNRESOLVED | Share-link gagal diuraikan | ❌ |
| METRIC_SPIKE | Kenaikan >10x dari catatan sebelumnya | ❌ |
| **Sudah ada** | view_spike, engagement_exceeds_views, duplicate_url, unknown_platform, zero_views_high_engagement, extreme_views, missing_url, missing_employee, negative_values | ✅ |

**Files to Fix:**
- `app/Services/CsvImportService.php` — method `detectRowAnomalies()` perlu expand signifikan

---

#### 6. BR-27 Level 1: Duplicate Check dalam Satu Pengiriman FYP
**Status: ❌ BELUM ADA**

**PRD:** FYP-01 multi-blok (max 10 blok), duplicate check sesama blok dalam satu pengiriman (BR-27 level 1).

**Current:** Form FYP hanya single-block per submit.

**Files to Fix:**
- `resources/js/Pages/Fyp/Index.jsx` — ubah jadi multi-block form (add/remove blok)
- `app/Http/Controllers/FypController.php` — `store()` terima array blok, validasi level 1

---

#### 7. ARS-03/04/05: Checksum Script di Paket + Upload Bukti Verifikasi
**Status: ⚠️ SEBAGIAN**

**Gaps:**
- ARS-03: Skrip verifikasi standalone **tidak ikut di-download** dalam paket arsip
- ARS-04: **Tidak ada endpoint upload** bukti verifikasi (admin upload hasil jalankan script)
- ARS-05: Penghapusan file asli manual, belum di-enforce sistem (harus cek bukti verifikasi dulu)

**Files to Fix:**
- `app/Http/Controllers/ArchiveController.php`:
  - `generate()`: sertakan `verify_checksum.php` script di zip
  - `verify()`: terima upload file hasil verifikasi, validasi, baru hapus file asli
- `resources/js/Pages/Archive/Verify.jsx` — tambah upload bukti verifikasi

---

### P3 - MEDIUM

#### 8. FYP-05: Real-time Duplicate Check onBlur URL
**Status: ❌ BELUM ADA**

**PRD:** Pemeriksaan duplikasi saat kursor meninggalkan kolom tautan, sebelum isi kolom lain.

**Files to Fix:**
- `resources/js/Pages/Fyp/Index.jsx` — onBlur call API check duplicate
- `app/Http/Controllers/FypController.php` — endpoint `checkDuplicate` (return JSON)

---

#### 9. FYP-09: Preview Post (Opsional)
**Status: ❌ BELUM ADA**

**Files to Fix:**
- `resources/js/Pages/Fyp/Index.jsx` — oEmbed/iframe preview di form
- `app/Http/Controllers/FypController.php` — endpoint `preview` (fetch oEmbed)

---

#### 10. DSB-03: Mass Download Background → Link
**Status: ❌ BELUM ADA**

**Files to Fix:**
- `app/Http/Controllers/ContentController.php` — `bulkDownload()` (queue job, return signed URL)
- `resources/js/Pages/Content/Index.jsx` — button "Unduh Massal" (admin konten)

---

#### 11. KNT-14 / FYP-14: Draft Auto-save FYP
**Status: ❌ BELUM ADA** (Content sudah ada)

**Files to Fix:**
- `resources/js/Pages/Fyp/Index.jsx` — localStorage draft (mirip Content/Index.jsx)

---

### P4 - CONFIG & INFRA

#### 12. Database: Switch ke PostgreSQL 15+ (Wajib PRD)
**Status: ❌ SALAH — Default SQLite**

**Files to Fix:**
- `.env.example` — `DB_CONNECTION=pgsql`, `DB_PORT=5432`
- `config/database.php` — default pgsql
- Test migrasi di PG (bigint, json, enum, unique index OK)

---

#### 13. Subsystem A & B Query Guard
**Status: ⚠️ PERLU VALIDASI**

**PRD Owner Decision:** Tidak boleh ada query/join cross-subsystem kecuali via users table.

**Current:** Model relasi terpisah tapi tidak ada enforcer.

**Files to Fix:**
- `app/Services/SubsystemGuard.php` (NEW) — middleware/service cek query
- Atau: dokumentasi + code review convention

---

#### 14. NFR-12: File Upload Proteksi Akses Langsung
**Status: ❓ PERLU CEK**

**Current:** File di `storage/app/public` — accessible via `storage` symlink.

**Fix:** Policy/route proteksi (signed URL atau controller check role).

---

## 📁 FILE YANG PERLU DIBUAT/BARU

| File | Deskripsi |
|------|-----------|
| `app/Services/UrlNormalizationService.php` | Single component BR-20-26 (shared FYP+Import) |
| `app/Services/ThreadClusterService.php` | BR-45 cluster detection & decision |
| `app/Services/PerformanceCalculationService.php` | BR-50-55 calculation dengan config DB |
| `app/Models/PerformanceWeight.php` | Bobot skor config (BR-53) |
| `app/Models/FypCluster.php` | Cluster model (BR-45) |
| `database/migrations/xxxx_create_performance_weights_table.php` | |
| `database/migrations/xxxx_add_cluster_to_fyp_reports.php` | |
| `database/migrations/xxxx_create_fyp_clusters_table.php` | |

---

## 📝 CATATAN TAMBAHAN

### Seed Data (Bab 8 PRD)
- Volume data contoh: 100 karyawan, 5 admin, ±15 alias, ±450 identitas, 12 tema canonical + 30 kandidat, ±2000 content reports, ±6000 media, ±800 FYP, ±150 izin, ±2200 attendance, 2 CSV import ±2500 baris
- Proporsi anomali: 60% share-link, 1% platform mismatch, 18% identity mismatch, ±25 cluster, 55% zero views, ±20 variasi ejaan, ±5 nama salah, ±8 duplikat lintas karyawan
- **Seeder saat ini:** 20 karyawan (bukan 100), volume lebih kecil — perlu scale up sebelum UAT

### Teknologi (PRD 7.5)
- PostgreSQL 15+ **wajib** (bukan SQLite)
- Queue worker untuk: import, URL resolve, thumbnail, archive, bulk download
- Laravel + panel admin (Spatie Permission) — **sesuai**

### UAT Skenario (Bab 9.2) — 22 Skenario
Semua skenario UAT-01 s.d. UAT-22 harus lolos sebelum serah terima. Bebutuh data contoh yang mereproduksi kekacauan nyata (Bab 8.3).

---

## 🎯 RENCANA EKSEKUSI DISARANKAN

### Sprint 1 (P1 Critical) — 5-7 hari
1. `UrlNormalizationService` + `ResolveUrlJob` enhance + wiring FYP & Import
2. `ThreadClusterService` + migration + UI
3. `PerformanceCalculationService` + `PerformanceWeight` + wiring Import commit
4. Import dispatch ResolveUrlJob + UI progress

### Sprint 2 (P2 High) — 3-4 hari
5. Lengkapi 12 anomali BR-40 di `CsvImportService`
6. FYP multi-block form + duplicate level 1
7. Archive checksum script + upload bukti verifikasi + enforce hapus

### Sprint 3 (P3 Medium) — 2-3 hari
8. FYP onBlur duplicate check
9. FYP preview oEmbed
10. Content mass download background
11. FYP draft auto-save

### Sprint 4 (P4 Config) — 1-2 hari
12. Switch PostgreSQL + test migrasi
13. Subsystem query guard / convention
14. File upload proteksi akses langsung
15. Scale seed data ke volume PRD

---

## ✅ DEFINISI SELESAI (Definition of Done)

Perbaikan dianggap selesai bila:
- [ ] Semua P1 items implemented & tested
- [ ] Semua P2 items implemented & tested
- [ ] PostgreSQL 15+ berjalan di local & CI
- [ ] Seed data volume sesuai Bab 8.2 & anomali proporsi Bab 8.3
- [ ] 22 skenario UAT (Bab 9.2) **semua lolos**
- [ ] Dokumentasi teknis & user guide updated

---

**File ini adalah living document** — update saat perbaikan dilakukan.  
**Referensi PRD:** `prd sit-app.docx` & `PRD.md` di root project.