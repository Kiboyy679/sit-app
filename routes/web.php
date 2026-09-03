<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

require __DIR__.'/auth.php';

// TEMPORARY: Remove after first run
Route::get('/migrate-now', function () {
    Artisan::call('migrate', ['--force' => true]);
    return response(Artisan::output(), 200)->header('Content-Type', 'text/plain');
});

Route::get('/seed-now', function () {
    $step = request('step', 'all');
    $start = microtime(true);
    $output = [];

    if ($step === 'all' || $step === 'roles') {
        // 1. Permissions & roles
        $permissionNames = ['manage_users','manage_content','review_fyp','manage_attendance','manage_import','view_reports','view_audit','manage_archive'];
        foreach ($permissionNames as $p) \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $p]);
        $roles = [
            'super_admin' => $permissionNames, 'admin_konten' => ['manage_content','view_reports','manage_archive'],
            'admin_fyp' => ['review_fyp','view_reports'], 'admin_absensi' => ['manage_attendance','view_reports'], 'karyawan' => [],
        ];
        foreach ($roles as $name => $perms) { $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $name]); $role->syncPermissions($perms); }
        $output[] = "Roles OK";

        // 2. Admin users
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

    // 3. Karyawan (step=karyawan or all)
    if ($step === 'all' || $step === 'karyawan') {
        $units = ['Konten Kreatif','Social Media','Copywriting','Design','Video Produksi','Kampanye','Data Analyst','Digital Marketing'];
        $firstNames = ['Rina','Budi','Dewi','Ahmad','Siti','Rizki','Maya','Dimas','Fitri','Reza','Anisa','Fajar','Luthfi','Putri','Yoga','Nabila','Irfan','Citra','Bayu','Ayu','Dian','Rudi','Hendra','Lia','Tono','Wati','Agus','Eka','Joko','Kartika','Lestari','Mila','Nana','Omar','Pratama','Qory','Rani','Sari','Umi','Vina','Winda','Xena','Yanti','Zainal','Arief','Bella','Cika','Dina','Edo','Farah','Gilang','Hana','Indah','Juli','Kiki','Lulu','Mita','Nisa','Oscar','Pipi','Rara','Sinta','Tari','Ucup','Vera','Wulan','Zara','Aldo','Bima','Doni','Ella','Fadil','Gita','Hari','Ika','Jefri','Kania','Leo','Mira','Nanda','Olga','Putra','Tono','Ahmad','Budi','Cici','Dedi','Eka','Aldo','Bima','Citra','Doni','Ella','Fadil','Gita','Hari','Ika','Jefri'];
        $lastNames = ['Sari','Santoso','Lestari','Fauzi','Nurhaliza','Pratama','Putri','Aditya','Handayani','Ramadhan','Rahmawati','Nugroho','Hidayat','Amelia','Saputra','Zahrani','Hakim','Dewi','Firmansyah','Permata','Wijaya','Kusuma','Anggraini','Wibowo','Sulistyaningsih','Purnama','Setiawan','Haryanto','Susanto','Purwanti','Widodo','Hermawan','Marlina','Syaputra','Utami','Azzahra','Pramudya','Ningtias','Halim','Rahayu','Maulana','Fitriani','Suryadi','Damayanti','Prasetyo','Rahmania','Ardiansyah','Lubis','Siregar','Tampubolon'];
        $existing = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->count();
        $karRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'karyawan']);
        $created = 0;
        for ($i = $existing; $i < 100; $i++) {
            $fn = $firstNames[$i % count($firstNames)];
            $ln = $lastNames[$i % count($lastNames)];
            $email = strtolower(preg_replace('/[^a-z0-9.]/','',$fn.'.'.$ln)).($i >= count($firstNames) ? ($i+1) : '').'@sit-app.local';
            $user = \App\Models\User::firstOrCreate(['email'=>$email], ['name'=>$fn.' '.$ln,'password'=>bcrypt('password123'),'unit'=>$units[$i%count($units)],'is_active'=>true]);
            if (!$user->hasRole('karyawan')) $user->assignRole('karyawan');
            $created++;
        }
        $output[] = "Karyawan: +{$created} (total " . (\App\Models\User::count()) . ")";
    }

    // 4. Themes + Aliases + Identities
    if ($step === 'all' || $step === 'themes') {
        $themeNames = ['Kampanye Brand','Tutorial Produk','Behind The Scene','Testimoni Pelanggan','Promo Diskon','Tips & Trik','Edukasi','Entertainment','Trending Topic','Seasonal Content','User Generated','Corporate'];
        foreach ($themeNames as $t) \App\Models\Theme::firstOrCreate(['normalized'=>strtolower(preg_replace('/[^a-z0-9]/i','',$t))], ['name'=>$t,'is_canonical'=>true,'usage_count'=>rand(5,50)]);
        foreach (['product review','daily vlog','funny moments'] as $t) \App\Models\Theme::firstOrCreate(['normalized'=>strtolower(preg_replace('/[^a-z0-9]/i','',$t))], ['name'=>$t,'is_canonical'=>false]);
        $output[] = "Themes: " . \App\Models\Theme::count();

        // Aliases
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        if (count($karyawans) >= 10) {
            $aliasPairs = [[$karyawans[0],'RinaS'],[$karyawans[0],'Rina S.'],[$karyawans[1],'Budi S'],[$karyawans[2],'Dewi L'],[$karyawans[4],'Siti N'],[$karyawans[5],'Rizki P'],[$karyawans[10],'Anisa R'],[$karyawans[11],'Fajar N'],[$karyawans[15],'Nabila Z'],[$karyawans[16],'Irfan H'],[$karyawans[20],'Dian W'],[$karyawans[30],'Kartika K'],[$karyawans[40],'Umi W'],[$karyawans[50],'Edo F'],[$karyawans[60],'Oscar P']];
            foreach ($aliasPairs as [$uid,$a]) \App\Models\UserAlias::firstOrCreate(['user_id'=>$uid,'alias'=>$a]);
        }
        $output[] = "Aliases: " . \App\Models\UserAlias::count();

        // Identities (450)
        if (\App\Models\Identity::count() < 100) {
            $platforms = ['tiktok','instagram','youtube','facebook','x','threads'];
            $batch = [];
            for ($i = 0; $i < 450; $i++) {
                $batch[] = ['name'=>'Brand_'.($i+1),'brand'=>'Brand_'.(($i%30)+1),'platform'=>$platforms[array_rand($platforms)],'account_handle'=>'@brand'.($i+1),'created_at'=>now(),'updated_at'=>now()];
                if (count($batch) >= 100) { \App\Models\Identity::insert($batch); $batch = []; }
            }
            if (!empty($batch)) \App\Models\Identity::insert($batch);
        }
        $output[] = "Identities: " . \App\Models\Identity::count();
    }

    // 5. Content + FYP + Leave + Attendance (separate steps for timeout safety)
    if ($step === 'content') {
        $period = date('Y-m');
        $themes = \App\Models\Theme::where('is_canonical', true)->get();
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($i = 0; $i < rand(15,25); $i++) {
                $batch[] = ['user_id'=>$uid,'theme_id'=>$themes->random()->id,'report_date'=>now()->subDays(rand(0,27)),'period'=>$period,'views'=>rand(0,5000),'file_count'=>rand(1,3),'created_at'=>now(),'updated_at'=>now()];
            }
        }
        foreach (array_chunk($batch, 200) as $chunk) \App\Models\ContentReport::insert($chunk);
        $output[] = "Content reports: " . \App\Models\ContentReport::count();
    }
    if ($step === 'fyp') {
        $platforms = ['tiktok','instagram','youtube','facebook','x','threads'];
        $themes = \App\Models\Theme::where('is_canonical', true)->get();
        $adminFyp = \App\Models\User::where('email','fyp@sit-app.local')->first();
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($i = 0; $i < rand(5,10); $i++) {
                $views = rand(100,50000); $eng = rand(0, intval($views*0.1));
                $rand = rand(1,100); $status = $rand<=15?'rejected':($rand<=40?'pending':'approved');
                $batch[] = ['user_id'=>$uid,'theme_id'=>$themes->random()->id,'platform'=>$platforms[array_rand($platforms)],'original_url'=>'https://tiktok.com/@user/video/'.rand(100000000,999999999),'content_key'=>'tiktok_'.uniqid(),'post_type'=>['main','reply','comment'][array_rand(['main','reply','comment'])],'impressions'=>$views,'engagements'=>$eng,'status'=>$status,'reviewer_id'=>$status!=='pending'?($adminFyp?->id):null,'engagement_exceeds_views'=>$eng>$views,'created_at'=>now(),'updated_at'=>now()];
            }
        }
        foreach (array_chunk($batch, 200) as $chunk) \App\Models\FypReport::insert($chunk);
        $output[] = "FYP reports: " . \App\Models\FypReport::count();
    }
    if ($step === 'leave') {
        $adminAbs = \App\Models\User::where('email','absensi@sit-app.local')->first();
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->toArray();
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
    if ($step === 'attendance') {
        $adminAbs = \App\Models\User::where('email','absensi@sit-app.local')->first();
        $karyawans = \App\Models\User::where('roles.name','karyawan')->join('model_has_roles','users.id','=','model_has_roles.model_id')->join('roles','model_has_roles.role_id','=','roles.id')->pluck('users.id')->take(50)->toArray();
        $batch = [];
        foreach ($karyawans as $uid) {
            for ($d = 0; $d < 30; $d++) {
                $date = now()->subDays($d); if ($date->isWeekend()) continue;
                $rand=rand(1,100);
                if ($rand<=85) $st='hadir'; elseif($rand<=90)$st='izin'; elseif($rand<=93)$st='sakit'; elseif($rand<=97)$st='alfa'; elseif($rand<=99)$st='dinas_luar'; else $st='tugas_luar';
                $flags = null;
                if ($st==='hadir'&&rand(1,100)<=15) { $p=['terlambat','lembur','pulang_cepat','pindah_shift']; shuffle($p); $flags=array_slice($p,0,rand(1,2)); }
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
