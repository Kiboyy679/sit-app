<?php

// TEMPORARY: Run this once then REMOVE
// Hit: /migrate-now

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/migrate-now', function () {
    Artisan::call('migrate', ['--force' => true]);
    $migrateOutput = Artisan::output();

    Artisan::call('db:seed', ['--force' => true]);
    $seedOutput = Artisan::output();

    return response("MIGRATE:\n{$migrateOutput}\n\nSEED:\n{$seedOutput}", 200)
        ->header('Content-Type', 'text/plain');
});