<?php
// Vercel serverless: force runtime config overrides (config.php is cached at build time)
putenv('SESSION_DRIVER=database');
putenv('CACHE_STORE=database');
putenv('QUEUE_CONNECTION=database');

// Vercel: use /tmp as storage path (only writable dir in serverless)
$tmpStorage = sys_get_temp_dir() . '/laravel_storage';
$dirs = [
    $tmpStorage . '/framework/sessions',
    $tmpStorage . '/framework/views',
    $tmpStorage . '/framework/cache/data',
    $tmpStorage . '/logs',
];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Override storage path to writable /tmp
$app->useStoragePath($tmpStorage);

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();