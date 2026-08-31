<?php
namespace App\Http\Controllers;

use App\Models\{ContentReport, ContentMedia, Theme, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Storage};
use Inertia\Inertia;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $period = $request->get('period', now()->format('Y-m'));

        $query = ContentReport::with(['user', 'theme', 'media'])
            ->where('period', $period);

        // KNT-08: Karyawan hanya melihat data sendiri
        if (!$user->hasRole(['super_admin', 'admin_konten'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('theme_id')) {
            $query->where('theme_id', $request->theme_id);
        }
        if ($request->filled('user_id') && $user->hasRole(['super_admin', 'admin_konten'])) {
            $query->where('user_id', $request->user_id);
        }

        $reports = $query->latest('report_date')->paginate(20)->withQueryString();
        $themes = Theme::canonical()->orderBy('name')->get();
        $myCount = ContentReport::where('user_id', $user->id)->where('period', $period)->sum('file_count');

        return Inertia::render('Content/Index', compact('reports', 'themes', 'period', 'myCount'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'theme' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'files' => 'required|array|min:1|max:10',
            'files.*' => 'file|max:51200|mimes:jpg,jpeg,png,webp,mp4,mov', // 50MB max
        ]);

        // BR-05: Max 5 laporan per karyawan per hari
        $todayCount = ContentReport::where('user_id', Auth::id())
            ->whereDate('report_date', today())
            ->count();
        if ($todayCount >= 5) {
            return back()->withErrors(['files' => 'Anda sudah mengirim 5 laporan hari ini.']);
        }

        // BR-04: Cek duplikat hash dalam 30 hari
        $user = Auth::user();
        $period = now()->format('Y-m');

        DB::beginTransaction();
        try {
            // Find or create theme
            $normalized = strtolower(preg_replace('/[^a-z0-9]/i', '', $request->theme));
            $theme = Theme::firstOrCreate(
                ['normalized' => $normalized],
                ['name' => $request->theme, 'is_canonical' => false, 'usage_count' => 0]
            );
            $theme->increment('usage_count');

            // Create report (KNT-03: server date)
            $report = ContentReport::create([
                'user_id' => $user->id,
                'theme_id' => $theme->id,
                'report_date' => today(),
                'period' => $period,
                'views' => 0,
                'file_count' => count($request->file('files')),
            ]);

            // Process each file
            foreach ($request->file('files') as $file) {
                $hash = hash_file('sha256', $file->getRealPath());

                // BR-04: Check duplicate hash within 30 days
                $existingMedia = ContentMedia::where('file_hash', $hash)
                    ->whereHas('report', function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                          ->where('report_date', '>=', now()->subDays(30));
                    })->first();

                if ($existingMedia) {
                    DB::rollBack();
                    return back()->withErrors([
                        'files' => 'Berkas duplikat terdeteksi (sudah diunggah pada ' .
                                   $existingMedia->report->report_date->format('d M Y') . ').',
                    ]);
                }

                // Store original file
                $path = $file->store('content/' . $user->id . '/' . $period, 'public');
                $fileType = strtolower($file->getClientOriginalExtension());

                // KNT-10: Compress & generate thumbnail for images
                $thumbnailPath = null;
                if (in_array($fileType, ['jpg', 'jpeg', 'png'])) {
                    $thumbnailPath = $this->generateThumbnail($file, $user->id, $period);
                }

                ContentMedia::create([
                    'content_report_id' => $report->id,
                    'file_path' => $path,
                    'file_type' => $fileType,
                    'file_size' => $file->getSize(),
                    'file_hash' => $hash,
                    'thumbnail_path' => $thumbnailPath,
                ]);
            }

            DB::commit();
            return back()->with('success', count($request->file('files')) . ' berkas berhasil diunggah.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['files' => 'Gagal mengunggah: ' . $e->getMessage()]);
        }
    }

    public function updateViews(Request $request, ContentReport $report)
    {
        $request->validate(['views' => 'required|integer|min:0']);

        $oldViews = $report->views;
        $report->update([
            'views' => $request->views,
            'views_updated_at' => now(),
        ]);

        // KNT-07: Audit log
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'update_views',
            'auditable_type' => ContentReport::class,
            'auditable_id' => $report->id,
            'old_values' => ['views' => $oldViews],
            'new_values' => ['views' => $request->views],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Jumlah penayangan berhasil diperbarui.');
    }

    private function generateThumbnail($file, $userId, $period)
    {
        try {
            $img = \Intervention\Image\ImageManager::gd()->make($file->getRealPath());
            // KNT-10: Max 1600px panjang sisi terpanjang
            $img->resize(1600, 1600, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $thumbName = 'thumb_' . uniqid() . '.webp';
            $thumbPath = 'content/' . $userId . '/' . $period . '/' . $thumbName;
            $fullPath = storage_path('app/public/' . $thumbPath);
            $img->encode('webp', 80)->save($fullPath);
            return $thumbPath;
        } catch (\Exception $e) {
            return null;
        }
    }
}
