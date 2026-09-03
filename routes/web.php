<?php

use App\Http\Controllers\{
    UserController, AliasController, ThemeController,
    DashboardController, ContentController, FypController,
    LeaveController, AttendanceController, PerformanceController, AuditController,
    ImportController, IdentityController, ArchiveController
};
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

// ── Arsip Konten (rate: 30/minute) ──
Route::middleware(['auth', 'verified', 'throttle:content'])->prefix('content')->group(function () {
    Route::get('/', [ContentController::class, 'index'])->name('content.index');
    Route::post('/', [ContentController::class, 'store'])->name('content.store');
    Route::put('/{report}/views', [ContentController::class, 'updateViews'])->name('content.updateViews');
});
RateLimiter::for('content', function () {
    return \Illuminate\Http\Request::class . ':30,1';
});

// ── FYP (rate: 30/minute) ──
Route::middleware(['auth', 'verified', 'throttle:fyp'])->prefix('fyp')->group(function () {
    Route::get('/', [FypController::class, 'index'])->name('fyp.index');
    Route::post('/', [FypController::class, 'store'])->name('fyp.store');
    Route::put('/{report}/review', [FypController::class, 'review'])->name('fyp.review');
    Route::post('/bulk-review', [FypController::class, 'bulkReview'])->name('fyp.bulkReview');
});
RateLimiter::for('fyp', function () {
    return \Illuminate\Http\Request::class . ':30,1';
});

// ── Izin ──
Route::middleware(['auth', 'verified'])->prefix('leave')->group(function () {
    Route::get('/', [LeaveController::class, 'index'])->name('leave.index');
    Route::post('/', [LeaveController::class, 'store'])->name('leave.store');
    Route::put('/{leave}/review', [LeaveController::class, 'review'])->name('leave.review');
});

// ── Kehadiran ──
Route::middleware(['auth', 'verified'])->prefix('attendance')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('/export', [AttendanceController::class, 'export'])->name('attendance.export');
});

// ── Laporan Kinerja (super_admin) ──
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('performance')->group(function () {
    Route::get('/', [PerformanceController::class, 'index'])->name('performance.index');
});

// ── Jejak Audit (super_admin) ──
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('audit')->group(function () {
    Route::get('/', [AuditController::class, 'index'])->name('audit.index');
});

// ── Manajemen Identitas (super_admin) ──
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('identity')->group(function () {
    Route::get('/', [IdentityController::class, 'index'])->name('identity.index');
    Route::post('/', [IdentityController::class, 'store'])->name('identity.store');
    Route::put('/{identity}', [IdentityController::class, 'update'])->name('identity.update');
    Route::delete('/{identity}', [IdentityController::class, 'destroy'])->name('identity.destroy');
    Route::get('/{identity}/detail', [IdentityController::class, 'detail'])->name('identity.detail');
    Route::post('/{identity}/record', [IdentityController::class, 'storeRecord'])->name('identity.storeRecord');
    Route::post('/merge', [IdentityController::class, 'merge'])->name('identity.merge');
});

// ── Import CSV (super_admin, rate: 5/minute) ──
Route::middleware(['auth', 'verified', 'role:super_admin', 'throttle:import'])->prefix('import')->group(function () {
    Route::get('/', [ImportController::class, 'index'])->name('import.index');
    Route::post('/upload', [ImportController::class, 'upload'])->name('import.upload');
    Route::get('/preview/{batch}', [ImportController::class, 'preview'])->name('import.preview');
    Route::post('/process/{batch}', [ImportController::class, 'process'])->name('import.process');
    Route::post('/skip/{batch}', [ImportController::class, 'skipRow'])->name('import.skipRow');
    Route::post('/commit/{batch}', [ImportController::class, 'commit'])->name('import.commit');
    Route::delete('/{batch}', [ImportController::class, 'destroy'])->name('import.destroy');
});
RateLimiter::for('import', function () {
    return \Illuminate\Http\Request::class . ':5,1';
});

// ── Admin: User Management ──
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::put('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.resetPassword');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('aliases', [AliasController::class, 'index'])->name('aliases.index');
    Route::post('aliases', [AliasController::class, 'store'])->name('aliases.store');
    Route::delete('aliases/{alias}', [AliasController::class, 'destroy'])->name('aliases.destroy');
});

// ── Admin Konten: Theme Management ──
Route::middleware(['auth', 'verified', 'role:super_admin|admin_konten'])->prefix('admin')->group(function () {
    Route::get('themes', [ThemeController::class, 'index'])->name('themes.index');
    Route::post('themes', [ThemeController::class, 'store'])->name('themes.store');
    Route::put('themes/{theme}', [ThemeController::class, 'update'])->name('themes.update');
    Route::post('themes/{theme}/merge', [ThemeController::class, 'merge'])->name('themes.merge');
    Route::post('themes/{theme}/approve', [ThemeController::class, 'approve'])->name('themes.approve');
    Route::delete('themes/{theme}', [ThemeController::class, 'destroy'])->name('themes.destroy');
});

// ── Arsip Mingguan (super_admin) ──
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('archive')->group(function () {
    Route::get('/', [ArchiveController::class, 'index'])->name('archive.index');
    Route::post('/generate', [ArchiveController::class, 'generate'])->name('archive.generate');
    Route::get('/verify/{period}', [ArchiveController::class, 'verify'])->name('archive.verify');
});

require __DIR__.'/auth.php';

// ── TEMPORARY: Seed & Migrate (remove after first run) ──
Route::get('/migrate-now', function () {
    Artisan::call('migrate', ['--force' => true]);
    return response(Artisan::output(), 200)->header('Content-Type', 'text/plain');
});

Route::get('/seed-now', function () {
    $step = request('step', 'all');
    $start = microtime(true);
    $output = [];

    if ($step === 'all' || $step === 'roles') {
        $permissionNames = ['manage_users','manage_content','review_fyp','manage_attendance','manage_import','view_reports','view_audit','manage_archive'];
        foreach ($permissionNames as $p) \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $p]);
        $roles = [
            'super_admin' => $permissionNames, 'admin_konten' => ['manage_content','view_reports','view_archive'],
            'admin_fyp' => ['review_fyp','view_reports'], 'admin_absensi' => ['manage_attendance','view_reports'], 'karyawan' => [],
        ];
        foreach ($roles as $name => $perms) { $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $name]); $role->syncPermissions($perms); }
        $output[] = "Roles OK";

        $adminUsers = [];
        foreach ([
            ['Super Admin','super@sit-app.local','super_admin','IT'],
            ['Admin Konten','konten@sit-app.local','admin_konten','Konten Kreatif'],
            ['Admin FYP','fyp@sit-app.local','admin_fyp','Social Media'],
            ['Admin Absensi','absensi@sit-app.local','admin_absensi','HR'],
        ] as [$name,$email,$role,$unit]) {
            $user = \App\Models\User::firstOrCreate(['email'=>$email], ['name'=>$name,'password'=>bcrypt('password123'),'unit'=>$unit,'is_active'=>true]);
            if (!$user->hasRole($role)) $user->assignRole($role);
            $adminUsers[$role] = $user;
        }
        $output[] = "Admins OK";
    }

    if ($step === 'all' || $step === 'karyawan') {
        $adminAbs = \App\Models\User::where('email','absensi@sit-app.local')->first();
        $names = ['Ahmad','Budi','Citra','Dewi','Eka','Fajar','Gita','Hadi','Indah','Joko','Kartika','Lukman','Maya','Nanda','Omar','Putri','Rizky','Sari','Tono','Umar','Vina','Wati','Yusuf','Zahra','Andi','Bayu','Cempluk','Dani','Erfan','Fitri','Gilang','Heri','Ika','Jasmine','Kurnia','Lestari','Maskur','Ningsih','Oni','Pratama','Ratna','Siti','Taufik','Ulya','Vera','Winda','Yoga','Zaki','Adit','Bima'];
        $batch = [];
        foreach ($names as $i => $name) {
            $email = strtolower(str_replace(' ','.',$name)) . '@sit-app.local';
            $user = \App\Models\User::firstOrCreate(['email'=>$email], ['name'=>$name,'password'=>bcrypt('password123'),'unit'=>['IT','HR','Marketing','Finance','Ops'][array_rand(['IT','HR','Marketing','Finance','Ops'])],'is_active'=>true]);
            if (!$user->hasRole('karyawan')) $user->assignRole('karyawan');
            $batch[] = $user->id;
        }
        // Extra karyawan 51-120
        for ($i = 51; $i <= 120; $i++) {
            $email = "karyawan{$i}@sit-app.local";
            $user = \App\Models\User::firstOrCreate(['email'=>$email], ['name'=>"Karyawan $i",'password'=>bcrypt('password123'),'unit'=>['IT','HR','Marketing','Finance','Ops'][array_rand(['IT','HR','Marketing','Finance','Ops'])],'is_active'=>true]);
            if (!$user->hasRole('karyawan')) $user->assignRole('karyawan');
            $batch[] = $user->id;
        }
        $output[] = "Karyawan: " . \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->count();
    }

    if ($step === 'all' || $step === 'themes') {
        $themeNames = ['Kesehatan Mental','Pendidikan','Lingkungan','Teknologi','Budaya','Olahraga','Sosial','Ekonomi','Hukum','Politik','Seni','Kuliner','Traveling','Fashion','Kecantikan'];
        $themeAliases = [['mental','jiwa','anxiety'],['edukasi','sekolah','belajar'],['alam','sampah','recycle'],['ai','digital','gadget'],['tradisi','adat','kesenian'],['sport','fitness','olah raga'],['community','volunteer','gotong'],['inflation','bisnis','startup'],['legal','undang','regulasi'],['pemilu','governance','politik'],['art','music','lukisan'],['food','resep','jajangan'],['wisata','trip','jalan-jalan'],['style','ootd','busana'],['skincare','beauty','makeup']];
        foreach ($themeNames as $i => $name) {
            $theme = \App\Models\Theme::firstOrCreate(['name'=>$name], ['is_canonical'=>true,'status'=>'approved']);
            if (isset($themeAliases[$i])) {
                foreach ($themeAliases[$i] as $alias) {
                    \App\Models\ThemeAlias::firstOrCreate(['theme_id'=>$theme->id,'alias'=>$alias]);
                }
            }
            // Create identities per theme
            for ($j = 0; $j < rand(5,15); $j++) {
                \App\Models\Identity::firstOrCreate(
                    ['platform'=>['tiktok','instagram','youtube'][rand(0,2)],'handle'=>'@'.strtolower($name).'_'.$j],
                    ['theme_id'=>$theme->id,'display_name'=>$name.' Creator '.$j,'is_verified'=>rand(0,1)]
                );
            }
        }
        $output[] = "Themes: " . \App\Models\Theme::count();
        $output[] = "Aliases: " . \App\Models\ThemeAlias::count();
        $output[] = "Identities: " . \App\Models\Identity::count();
    }

    if ($step === 'all' || $step === 'content') {
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        $themes = \App\Models\Theme::pluck('id')->toArray();
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($d = 0; $d < rand(5,20); $d++) {
                $date = now()->subDays(rand(1,60)); if ($date->isWeekend()) continue;
                $themesUsed = array_slice($themes, 0, rand(1,3));
                foreach ($themesUsed as $tid) {
                    $platform = ['tiktok','instagram','youtube','facebook','x','threads'][rand(0,5)];
                    $views = rand(100,50000);
                    $engagements = min($views, rand(10,intval($views*0.3)));
                    $batch[] = ['user_id'=>$uid,'theme_id'=>$tid,'platform'=>$platform,'url'=>"https://{$platform}.com/post/".bin2hex(random_bytes(6)),'file_count'=>rand(1,5),'view_count'=>$views,'engagement_count'=>$engagements,'submitted_at'=>$date->toDateTimeString(),'created_at'=>$date->toDateTimeString(),'updated_at'=>$date->toDateTimeString()];
                }
            }
        }
        foreach (array_chunk($batch, 500) as $chunk) \App\Models\ContentReport::insert($chunk);
        $output[] = "Content: " . \App\Models\ContentReport::count();
    }

    if ($step === 'all' || $step === 'fyp') {
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        $themes = \App\Models\Theme::pluck('id')->toArray();
        $platforms = ['tiktok','instagram','youtube','facebook','x','threads'];
        $postTypes = ['main','reply','comment'];
        $statuses = ['pending','approved','rejected'];
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($i = 0; $i < rand(1,8); $i++) {
                $date = now()->subDays(rand(1,30));
                $platform = $platforms[array_rand($platforms)];
                $views = rand(50,100000);
                $engagements = min($views, rand(5,intval($views*0.25)));
                $engagementExceeds = $engagements > $views;
                $batch[] = [
                    'user_id'=>$uid,'theme_id'=>$themes[array_rand($themes)],'platform'=>$platform,
                    'original_url'=>"https://{$platform}.com/@".bin2hex(random_bytes(4))."/".bin2hex(random_bytes(6)),
                    'normalized_url'=>"https://{$platform}.com/@".bin2hex(random_bytes(4))."/".bin2hex(random_bytes(6)),
                    'post_type'=>$postTypes[array_rand($postTypes)],'impressions'=>$views,'engagements'=>$engagements,
                    'engagement_exceeds_views'=>$engagementExceeds,
                    'status'=>$statuses[array_rand($statuses)],
                    'submitted_at'=>$date->toDateTimeString(),'created_at'=>$date->toDateTimeString(),'updated_at'=>$date->toDateTimeString()
                ];
            }
        }
        foreach (array_chunk($batch, 500) as $chunk) \App\Models\FypReport::insert($chunk);
        $output[] = "FYP: " . \App\Models\FypReport::count();
    }

    if ($step === 'all' || $step === 'leave') {
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        $adminAbs = \App\Models\User::where('email','absensi@sit-app.local')->first();
        $batch = []; $types = ['izin','sakit','cuti','dinas_luar','lainnya'];
        foreach ($karyawans as $uid) {
            for ($i = 0; $i < rand(1,3); $i++) {
                $leaveDate = now()->subDays(rand(1,28)); $rand=rand(1,100); $st=$rand<=20?'pending':($rand<=80?'approved':'rejected');
                $batch[] = ['user_id'=>$uid,'start_date'=>$leaveDate->format('Y-m-d'),'end_date'=>$leaveDate->copy()->addDays(rand(0,2))->format('Y-m-d'),'type'=>$types[array_rand($types)],'description'=>'Keterangan izin','status'=>$st,'approver_id'=>$adminAbs?->id,'created_at'=>now(),'updated_at'=>now()];
            }
        }
        foreach (array_chunk($batch, 200) as $chunk) \App\Models\LeaveRequest::insert($chunk);
        $output[] = "Leave requests: " . \App\Models\LeaveRequest::count();
    }

    if ($step === 'all' || $step === 'attendance') {
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->take(50)->toArray();
        $adminAbs = \App\Models\User::where('email','absensi@sit-app.local')->first();
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($d = 0; $d < 30; $d++) {
                $date = now()->subDays($d); if ($date->isWeekend()) continue;
                $rand=rand(1,100);
                if ($rand<=85) $st='hadir'; elseif($rand<=90)$st='izin'; elseif($rand<=93)$st='sakit'; elseif($rand<=97)$st='alfa'; elseif($rand<=99)$st='dinas_luar'; else $st='tugas_luar';
                $flags = null;
                if ($st==='hadir'&&rand(1,100)<=15) { $p=['terlambat','lembur','pulang_cepat','pindah_shift']; shuffle($p); $flags=json_encode(array_slice($p,0,rand(1,2))); }
                $batch[] = ['user_id'=>$uid,'date'=>$date->format('Y-m-d'),'status'=>$st,'flags'=>$flags,'recorded_by'=>$adminAbs?->id,'created_at'=>now(),'updated_at'=>now()];
            }
        }
        foreach (array_chunk($batch, 200) as $chunk) \App\Models\Attendance::insert($chunk);
        $output[] = "Attendance: " . \App\Models\Attendance::count();
    }

    $elapsed = round(microtime(true) - $start, 2);
    $summary = "=== STEP: {$step} ({$elapsed}s) ===\n"
        . "Users: " . \App\Models\User::count() . "\n"
        . "Content: " . \App\Models\ContentReport::count() . "\n"
        . "FYP: " . \App\Models\FypReport::count() . "\n"
        . "Leave: " . \App\Models\LeaveRequest::count() . "\n"
        . "Attendance: " . \App\Models\Attendance::count() . "\n"
        . "Themes: " . \App\Models\Theme::count() . "\n"
        . "Identities: " . \App\Models\Identity::count() . "\n"
        . "\n" . implode("\n", $output);

    return response($summary, 200)->header('Content-Type', 'text/plain');
});
