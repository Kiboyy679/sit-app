<?php
namespace App\Http\Controllers;

use App\Models\{FypReport, Theme, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Inertia\Inertia;

class FypController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = FypReport::with(['user', 'theme', 'reviewer']);

        if ($user->hasRole('karyawan')) {
            $query->where('user_id', $user->id);
        }

        // Filters
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('platform')) $query->where('platform', $request->platform);
        if ($request->filled('theme_id')) $query->where('theme_id', $request->theme_id);
        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('original_url', 'like', "%{$s}%")
                  ->orWhere('content_key', 'like', "%{$s}%");
            });
        }

        $reports = $query->latest()->paginate(15)->withQueryString();
        $themes = Theme::canonical()->orderBy('name')->get();

        // Stats
        $period = now()->format('Y-m');
        $stats = [
            'pending' => FypReport::where('status', 'pending')->count(),
            'approved' => FypReport::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'rejected' => FypReport::where('status', 'rejected')->whereMonth('created_at', now()->month)->count(),
            'total' => FypReport::whereMonth('created_at', now()->month)->count(),
        ];

        $karyawanList = $user->hasRole(['super_admin', 'admin_fyp'])
            ? \App\Models\User::orderBy('name')->get()
            : collect();

        return Inertia::render('Fyp/Index', compact('reports', 'themes', 'stats', 'karyawanList'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'original_url' => 'required|url|max:2048',
            'platform' => 'required|in:tiktok,instagram,youtube,facebook,x,threads',
            'theme_id' => 'required|exists:themes,id',
            'post_type' => 'required|in:main,reply,comment',
            'impressions' => 'required|integer|min:0',
            'engagements' => 'required|integer|min:0',
        ]);

        // BR-08: engagement <= impressions
        if ($validated['engagements'] > $validated['impressions']) {
            return back()->withErrors([
                'engagements' => 'Jumlah interaksi tidak boleh melebihi jumlah penayangan.',
            ]);
        }

        $user = Auth::user();

        // BR-07: Duplicate check (URL + user + content_key same period)
        $duplicate = FypReport::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->where(function ($q) use ($validated) {
                $q->where('original_url', $validated['original_url'])
                  ->orWhere(function ($q2) use ($validated, $user) {
                      $q2->where('user_id', $user->id);
                  });
            })->first();

        // Normalize URL
        $normalizedUrl = $this->normalizeUrl($validated['original_url'], $validated['platform']);

        // Generate content_key
        $contentKey = $validated['platform'] . '_' . md5($normalizedUrl);

        $existing = FypReport::where('content_key', $contentKey)
            ->whereMonth('created_at', now()->month)
            ->first();
        if ($existing) {
            return back()->withErrors([
                'original_url' => 'Laporan serupa sudah ada untuk URL ini di periode ini.',
            ]);
        }

        DB::beginTransaction();
        try {
            $report = FypReport::create([
                'user_id' => $user->id,
                'theme_id' => $validated['theme_id'],
                'platform' => $validated['platform'],
                'original_url' => $validated['original_url'],
                'content_key' => $contentKey,
                'post_type' => $validated['post_type'],
                'impressions' => $validated['impressions'],
                'engagements' => $validated['engagements'],
                'engagement_exceeds_views' => $validated['engagements'] > $validated['impressions'],
                'status' => 'pending',
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'fyp_submit',
                'auditable_type' => FypReport::class,
                'auditable_id' => $report->id,
                'new_values' => $validated,
                'ip_address' => $request->ip(),
            ]);

            DB::commit();
            return back()->with('success', 'Laporan FYP berhasil dikirim.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['original_url' => 'Gagal mengirim: ' . $e->getMessage()]);
        }
    }

    public function review(Request $request, FypReport $report)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:500',
        ]);

        $report->update([
            'status' => $validated['status'],
            'reviewer_id' => Auth::id(),
            'review_note' => $validated['review_note'] ?? null,
            'reviewed_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'fyp_' . $validated['status'],
            'auditable_type' => FypReport::class,
            'auditable_id' => $report->id,
            'old_values' => ['status' => 'pending'],
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Laporan berhasil ' . ($validated['status'] === 'approved' ? 'disetujui' : 'ditolak') . '.');
    }

    public function bulkReview(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:fyp_reports,id',
            'status' => 'required|in:approved,rejected',
        ]);

        DB::beginTransaction();
        try {
            FypReport::whereIn('id', $validated['ids'])
                ->where('status', 'pending')
                ->update([
                    'status' => $validated['status'],
                    'reviewer_id' => Auth::id(),
                    'reviewed_at' => now(),
                ]);

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'fyp_bulk_' . $validated['status'],
                'auditable_type' => FypReport::class,
                'auditable_id' => 0,
                'new_values' => ['ids' => $validated['ids'], 'count' => count($validated['ids'])],
                'ip_address' => $request->ip(),
            ]);

            DB::commit();
            return back()->with('success', count($validated['ids']) . ' laporan berhasil diproses.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['ids' => 'Gagal memproses: ' . $e->getMessage()]);
        }
    }

    private function normalizeUrl(string $url, string $platform): string
    {
        $parsed = parse_url($url);
        $path = trim($parsed['path'] ?? '', '/');
        $segments = explode('/', $path);

        switch ($platform) {
            case 'tiktok':
                // Remove query params, keep /@user/video/ID
                return 'https://www.tiktok.com/' . $path;
            case 'instagram':
                // Remove reels/watch/ prefix
                if (($key = array_search('reels', $segments)) !== false || ($key = array_search('watch', $segments)) !== false) {
                    array_splice($segments, $key, 1);
                }
                return 'https://www.instagram.com/' . implode('/', $segments);
            case 'youtube':
                // Normalize to /watch?v=ID or /shorts/ID
                parse_str($parsed['query'] ?? '', $qs);
                if (isset($qs['v'])) return 'https://www.youtube.com/watch?v=' . $qs['v'];
                return 'https://www.youtube.com/' . $path;
            default:
                return 'https://' . ($parsed['host'] ?? '') . '/' . $path;
        }
    }
}
