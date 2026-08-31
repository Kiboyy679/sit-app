<?php
namespace App\Http\Controllers;

use App\Models\{ContentReport, ContentMedia, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, File};
use Inertia\Inertia;
use ZipArchive;

class ArchiveController extends Controller
{
    public function index()
    {
        $archives = Storage::disk('public')->directories('archives') ?? [];
        $archives = array_map(function ($path) {
            $name = basename($path);
            $files = Storage::disk('public')->files($path);
            $checksumFile = collect($files)->first(fn($f) => str_ends_with($f, '_checksums.txt'));
            return [
                'name' => $name,
                'file_count' => count($files) - ($checksumFile ? 1 : 0),
                'has_checksum' => (bool) $checksumFile,
                'created_at' => Storage::disk('public')->lastModified($path . '/' . ($files[0] ?? '')),
            ];
        }, $archives);

        return Inertia::render('Archive/Index', compact('archives'));
    }

    public function generate(Request $request)
    {
        $request->validate(['week' => 'required|date']);
        $weekStart = now()->parse($request->week)->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();
        $period = $weekStart->format('Y-m-d');

        $reports = ContentReport::with('media')
            ->whereBetween('report_date', [$weekStart, $weekEnd])
            ->get();

        if ($reports->isEmpty()) {
            return back()->withErrors(['week' => 'Tidak ada konten untuk minggu ini.']);
        }

        $archivePath = "archives/{$period}";
        $checksums = [];

        foreach ($reports as $report) {
            foreach ($report->media as $media) {
                $sourcePath = storage_path('app/public/' . $media->file_path);
                if (file_exists($sourcePath)) {
                    $destPath = $archivePath . '/' . basename($media->file_path);
                    Storage::disk('public')->put($destPath, file_get_contents($sourcePath));
                    $checksums[basename($media->file_path)] = hash_file('sha256', $sourcePath);
                }
            }
        }

        // Write checksum file
        $checksumContent = "SIT-APP Weekly Archive Checksum\n";
        $checksumContent .= "Period: {$period}\n";
        $checksumContent .= "Generated: " . now()->toIso8601String() . "\n";
        $checksumContent .= str_repeat('=', 60) . "\n";
        foreach ($checksums as $file => $hash) {
            $checksumContent .= "{$hash}  {$file}\n";
        }
        Storage::disk('public')->put($archivePath . "/{$period}_checksums.txt", $checksumContent);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'archive_generate',
            'auditable_type' => ContentReport::class,
            'auditable_id' => 0,
            'new_values' => ['period' => $period, 'files' => count($checksums)],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Arsip mingguan berhasil dibuat: ' . count($checksums) . ' berkas.');
    }

    public function verify(Request $request, string $period)
    {
        $archivePath = "archives/{$period}";
        $checksumFile = Storage::disk('public')->get($archivePath . "/{$period}_checksums.txt");

        if (!$checksumFile) {
            return back()->withErrors(['period' => 'File checksum tidak ditemukan.']);
        }

        $results = [];
        $lines = explode("\n", $checksumFile);
        foreach ($lines as $line) {
            if (preg_match('/^([a-f0-9]{64})\s+(.+)$/', trim($line), $matches)) {
                $expectedHash = $matches[1];
                $filename = $matches[2];
                $filePath = storage_path('app/public/' . $archivePath . '/' . $filename);
                if (file_exists($filePath)) {
                    $actualHash = hash_file('sha256', $filePath);
                    $results[] = [
                        'file' => $filename,
                        'valid' => $expectedHash === $actualHash,
                        'expected' => $expectedHash,
                        'actual' => $actualHash,
                    ];
                } else {
                    $results[] = ['file' => $filename, 'valid' => false, 'error' => 'File tidak ditemukan'];
                }
            }
        }

        $allValid = collect($results)->every('valid', true);
        return Inertia::render('Archive/Verify', compact('results', 'allValid', 'period'));
    }
}
