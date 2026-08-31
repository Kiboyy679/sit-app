<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Theme;
use App\Models\UserAlias;
use App\Models\Identity;
use App\Models\ContentReport;
use App\Models\ContentMedia;
use App\Models\FypReport;
use App\Models\LeaveRequest;
use App\Models\Attendance;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Permission::query()->delete();
        Role::query()->delete();

        $permissions = [
            'manage_users', 'manage_content', 'review_fyp', 'manage_attendance',
            'manage_import', 'view_reports', 'view_audit', 'manage_archive',
        ];
        foreach ($permissions as $p) Permission::create(['name' => $p]);

        $roles = [
            'super_admin'   => $permissions,
            'admin_konten'  => ['manage_content', 'view_reports', 'manage_archive'],
            'admin_fyp'     => ['review_fyp', 'view_reports'],
            'admin_absensi' => ['manage_attendance', 'view_reports'],
            'karyawan'      => [],
        ];
        foreach ($roles as $name => $perms) {
            $role = Role::create(['name' => $name]);
            $role->syncPermissions($perms);
        }

        $units = ['Konten Kreatif', 'Social Media', 'Copywriting', 'Design', 'Video Produksi', 'Kampanye'];
        $platforms = ['tiktok', 'instagram', 'youtube', 'facebook', 'x', 'threads'];

        // Super Admin
        $super = User::create([
            'name' => 'Super Admin', 'email' => 'super@sit-app.local',
            'password' => Hash::make('password123'), 'unit' => 'IT', 'is_active' => true,
        ]);
        $super->assignRole('super_admin');

        // Admin Users
        $adminKonten = $this->createAdmin('Admin Konten', 'konten@sit-app.local', 'Konten Kreatif', 'admin_konten');
        $adminFyp = $this->createAdmin('Admin FYP', 'fyp@sit-app.local', 'Social Media', 'admin_fyp');
        $adminAbsensi = $this->createAdmin('Admin Absensi', 'absensi@sit-app.local', 'HR', 'admin_absensi');

        // 20 Karyawan
        $names = [
            'Rina Sari', 'Budi Santoso', 'Dewi Lestari', 'Ahmad Fauzi', 'Siti Nurhaliza',
            'Rizki Pratama', 'Maya Putri', 'Dimas Aditya', 'Fitri Handayani', 'Reza Ramadhan',
            'Anisa Rahmawati', 'Fajar Nugroho', 'Luthfi Hidayat', 'Putri Amelia', 'Yoga Saputra',
            'Nabila Zahrani', 'Irfan Hakim', 'Citra Dewi', 'Bayu Firmansyah', 'Ayu Permata',
        ];

        $karyawans = [];
        foreach ($names as $i => $name) {
            $k = User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@sit-app.local',
                'password' => Hash::make('password123'),
                'unit' => $units[$i % count($units)],
                'is_active' => true,
            ]);
            $k->assignRole('karyawan');
            $karyawans[] = $k;
        }

        // Aliases
        $aliasData = [
            [$karyawans[0]->id, 'RinaS'], [$karyawans[0]->id, 'Rina S.'],
            [$karyawans[1]->id, 'Budi S'], [$karyawans[2]->id, 'Dewi L'],
            [$karyawans[4]->id, 'Siti N'], [$karyawans[5]->id, 'Rizki P'],
        ];
        foreach ($aliasData as [$uid, $alias]) {
            UserAlias::create(['user_id' => $uid, 'alias' => $alias]);
        }

        // 12 Canonical Themes
        $themeNames = ['Kampanye Brand', 'Tutorial Produk', 'Behind The Scene', 'Testimoni Pelanggan', 'Promo Diskon', 'Tips & Trik', 'Edukasi', 'Entertainment', 'Trending Topic', 'Seasonal Content', 'User Generated', 'Corporate'];
        foreach ($themeNames as $t) {
            Theme::create(['name' => $t, 'normalized' => strtolower(preg_replace('/[^a-z0-9]/i', '', $t)), 'is_canonical' => true, 'usage_count' => rand(5, 50)]);
        }
        foreach (['product review', 'daily vlog', 'funny moments'] as $t) {
            Theme::create(['name' => $t, 'normalized' => strtolower(preg_replace('/[^a-z0-9]/i', '', $t)), 'is_canonical' => false]);
        }

        // 450 Identities
        for ($i = 0; $i < 450; $i++) {
            Identity::create([
                'name' => 'Brand_' . ($i + 1),
                'brand' => 'Brand_' . (($i % 30) + 1),
                'platform' => $platforms[array_rand($platforms)],
                'account_handle' => '@brand' . ($i + 1),
            ]);
        }

        // Content Reports (~2000)
        $themes = Theme::where('is_canonical', true)->get();
        $period = date('Y-m');
        foreach ($karyawans as $k) {
            $count = rand(80, 120);
            for ($i = 0; $i < $count; $i++) {
                $cr = ContentReport::create([
                    'user_id' => $k->id,
                    'theme_id' => $themes->random()->id,
                    'report_date' => now()->subDays(rand(0, 27)),
                    'period' => $period,
                    'views' => rand(0, 5000),
                    'file_count' => rand(1, 3),
                ]);
                for ($m = 0; $m < $cr->file_count; $m++) {
                    ContentMedia::create([
                        'content_report_id' => $cr->id,
                        'file_path' => 'uploads/content/' . uniqid() . '.webp',
                        'file_type' => collect(['jpg', 'png', 'webp', 'mp4'])->random(),
                        'file_size' => rand(500000, 10000000),
                        'file_hash' => hash('sha256', uniqid()),
                        'thumbnail_path' => 'uploads/thumbs/' . uniqid() . '.webp',
                    ]);
                }
            }
        }

        // FYP Reports (~800)
        foreach ($karyawans as $k) {
            $count = rand(30, 50);
            for ($i = 0; $i < $count; $i++) {
                $rand = rand(1, 100);
                $status = $rand <= 15 ? 'rejected' : ($rand <= 40 ? 'pending' : 'approved');
                $views = rand(100, 50000);
                $engagements = rand(0, intval($views * 0.1));
                FypReport::create([
                    'user_id' => $k->id,
                    'theme_id' => $themes->random()->id,
                    'platform' => $platforms[array_rand($platforms)],
                    'original_url' => 'https://tiktok.com/@user/video/' . rand(100000000, 999999999),
                    'content_key' => 'tiktok_' . uniqid(),
                    'post_type' => collect(['main', 'reply', 'comment'])->random(),
                    'impressions' => $views,
                    'engagements' => $engagements,
                    'status' => $status,
                    'reviewer_id' => $status !== 'pending' ? $adminFyp->id : null,
                    'engagement_exceeds_views' => $engagements > $views,
                ]);
            }
        }

        // Leave Requests (~50)
        $leaveTypes = ['izin', 'sakit', 'cuti', 'dinas_luar', 'lainnya'];
        foreach ($karyawans as $k) {
            $count = rand(1, 5);
            for ($i = 0; $i < $count; $i++) {
                $start = now()->subDays(rand(1, 28));
                $rand = rand(1, 100);
                $status = $rand <= 20 ? 'pending' : ($rand <= 80 ? 'approved' : 'rejected');
                LeaveRequest::create([
                    'user_id' => $k->id,
                    'start_date' => $start,
                    'end_date' => $start->copy()->addDays(rand(0, 2)),
                    'type' => $leaveTypes[array_rand($leaveTypes)],
                    'description' => 'Keterangan izin nomor ' . ($i + 1),
                    'status' => $status,
                    'approver_id' => $adminAbsensi->id,
                ]);
            }
        }

        // Attendances (~2200)
        foreach ($karyawans as $k) {
            for ($d = 0; $d < 30; $d++) {
                $date = now()->subDays($d);
                if ($date->isWeekend()) continue;
                $rand = rand(1, 100);
                if ($rand <= 85) $status = 'hadir';
                elseif ($rand <= 90) $status = 'izin';
                elseif ($rand <= 93) $status = 'sakit';
                elseif ($rand <= 97) $status = 'alfa';
                elseif ($rand <= 99) $status = 'dinas_luar';
                else $status = 'tugas_luar';
                $flags = null;
                if ($status === 'hadir' && rand(1, 100) <= 15) {
                    $possible = ['terlambat', 'lembur', 'pulang_cepat', 'pindah_shift'];
                    shuffle($possible);
                    $flags = array_slice($possible, 0, rand(1, 2));
                }
                Attendance::create([
                    'user_id' => $k->id,
                    'date' => $date,
                    'status' => $status,
                    'flags' => $flags,
                    'recorded_by' => $adminAbsensi->id,
                ]);
            }
        }

        // Audit Log sample
        AuditLog::create([
            'user_id' => $adminFyp->id,
            'action' => 'seed_data',
            'auditable_type' => 'App\\Models\\User',
            'auditable_id' => $super->id,
            'new_values' => ['message' => 'Database seeder completed'],
            'ip_address' => '127.0.0.1',
        ]);

        echo "Seeded: " . User::count() . " users, " .
             ContentReport::count() . " content, " .
             FypReport::count() . " FYP, " .
             LeaveRequest::count() . " leaves, " .
             Attendance::count() . " attendances\n";
    }

    private function createAdmin(string $name, string $email, string $unit, string $role): User
    {
        $u = User::create([
            'name' => $name, 'email' => $email,
            'password' => Hash::make('password123'), 'unit' => $unit, 'is_active' => true,
        ]);
        $u->assignRole($role);
        return $u;
    }
}
