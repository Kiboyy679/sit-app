<?php

use App\Http\Controllers\{
    UserController, AliasController, ThemeController,
    DashboardController, ContentController, FypController,
    LeaveController, AttendanceController, PerformanceController, AuditController,
    ImportController, IdentityController, ArchiveController
};
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;

Route::get('/', fn() => redirect()->route('login'));

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

// ── Arsip Konten (rate: 30/minute) ──
Route::middleware(['auth', 'verified', 'throttle:content'])->prefix('content')->group(function () {
    Route::get('/', [ContentController::class, 'index'])->name('content.index');
    Route::post('/', [ContentController::class, 'store'])->name('content.store');
    Route::put('/{report}/views', [ContentController::class, 'updateViews'])->name('content.updateViews');
});
RateLimiter::for('content', function (\Illuminate\Http\Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
});

// ── FYP (rate: 30/minute) ──
Route::middleware(['auth', 'verified', 'throttle:fyp'])->prefix('fyp')->group(function () {
    Route::get('/', [FypController::class, 'index'])->name('fyp.index');
    Route::post('/', [FypController::class, 'store'])->name('fyp.store');
    Route::put('/{report}/review', [FypController::class, 'review'])->name('fyp.review');
    Route::post('/bulk-review', [FypController::class, 'bulkReview'])->name('fyp.bulkReview');
});
RateLimiter::for('fyp', function (\Illuminate\Http\Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
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
RateLimiter::for('import', function (\Illuminate\Http\Request $request) {
    return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
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

// TEMPORARY: Remove after first run
Route::get('/migrate-now', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    return response(\Illuminate\Support\Facades\Artisan::output(), 200)->header('Content-Type', 'text/plain');
});

Route::get('/seed-now', function () {
    // Create a super admin user directly
    $user = \App\Models\User::firstOrCreate(
        ['email' => 'super@sit-app.local'],
        [
            'name' => 'Super Admin',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'unit' => 'IT',
            'is_active' => true,
        ]
    );
    // Create role if not exists
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super_admin']);
    $user->assignRole('super_admin');
    return response("User created: super@sit-app.local / password123", 200)->header('Content-Type', 'text/plain');
});
