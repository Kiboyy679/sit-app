<?php

use App\Http\Controllers\{UserController, AliasController, ThemeController, DashboardController, ContentController};
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// ── Arsip Konten (KNT) ──
Route::middleware(['auth', 'verified'])->prefix('content')->group(function () {
    Route::get('/', [ContentController::class, 'index'])->name('content.index');
    Route::post('/', [ContentController::class, 'store'])->name('content.store');
    Route::put('/{report}/views', [ContentController::class, 'updateViews'])->name('content.updateViews');
});

// Admin: User Management (super_admin only)
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

// Admin Konten: Theme Management
Route::middleware(['auth', 'verified', 'role:super_admin|admin_konten'])->prefix('admin')->group(function () {
    Route::get('themes', [ThemeController::class, 'index'])->name('themes.index');
    Route::post('themes', [ThemeController::class, 'store'])->name('themes.store');
    Route::put('themes/{theme}', [ThemeController::class, 'update'])->name('themes.update');
    Route::post('themes/{theme}/merge', [ThemeController::class, 'merge'])->name('themes.merge');
    Route::post('themes/{theme}/approve', [ThemeController::class, 'approve'])->name('themes.approve');
    Route::delete('themes/{theme}', [ThemeController::class, 'destroy'])->name('themes.destroy');
});

require __DIR__.'/auth.php';
