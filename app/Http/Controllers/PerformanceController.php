<?php
namespace App\Http\Controllers;

use App\Models\{User, ContentReport, FypReport, Attendance, LeaveRequest, AuditLog, Theme};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PerformanceController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', now()->format('Y-m'));
        $prevPeriod = now()->subMonth()->format('Y-m');

        // ── Rekap per karyawan ──
        $karyawans = User::where('is_active', true)
            ->whereNull('employee_code')
            ->orderBy('name')
            ->get();

        $rekap = $karyawans->map(function ($k) use ($period, $prevPeriod) {
            $contentCount = ContentReport::where('user_id', $k->id)->where('period', $period)->sum('file_count');
            $totalViews = ContentReport::where('user_id', $k->id)->where('period', $period)->sum('views');
            $fypApproved = FypReport::where('user_id', $k->id)->where('status', 'approved')
                ->whereMonth('created_at', substr($period, 5, 2))->whereYear('created_at', substr($period, 0, 4))->count();
            $fypPending = FypReport::where('user_id', $k->id)->where('status', 'pending')->count();
            $fypRejected = FypReport::where('user_id', $k->id)->where('status', 'rejected')
                ->whereMonth('created_at', substr($period, 5, 2))->whereYear('created_at', substr($period, 0, 4))->count();
            $hadir = Attendance::where('user_id', $k->id)->whereMonth('date', substr($period, 5, 2))
                ->whereYear('date', substr($period, 0, 4))->where('status', 'hadir')->count();
            $alfa = Attendance::where('user_id', $k->id)->whereMonth('date', substr($period, 5, 2))
                ->whereYear('date', substr($period, 0, 4))->where('status', 'alfa')->count();
            $leavesPending = LeaveRequest::where('user_id', $k->id)->where('status', 'pending')->count();

            // Skor kinerja sederhana (0-100)
            $contentScore = min($contentCount * 2, 40); // max 40 dari konten
            $viewsScore = min(floor($totalViews / 1000) * 5, 30); // max 30 dari views
            $fypScore = min($fypApproved * 3, 20); // max 20 dari FYP
            $absenScore = ($hadir + $alfa) > 0 ? round(($hadir / ($hadir + $alfa)) * 10, 0) : 10; // max 10 dari absensi
            $score = $contentScore + $viewsScore + $fypScore + $absenScore;

            return [
                'name' => $k->name,
                'unit' => $k->unit,
                'content_count' => $contentCount,
                'total_views' => $totalViews,
                'fyp_approved' => $fypApproved,
                'fyp_pending' => $fypPending,
                'fyp_rejected' => $fypRejected,
                'hadir' => $hadir,
                'alfa' => $alfa,
                'leaves_pending' => $leavesPending,
                'score' => $score,
            ];
        })->sortByDesc('score')->values();

        // ── Distribusi tema ──
        $themeDistribution = Theme::where('is_canonical', true)
            ->select('name', 'usage_count')
            ->orderByDesc('usage_count')
            ->get();

        // ── Status FYP ──
        $fypStatus = [
            'approved' => FypReport::whereMonth('created_at', substr($period, 5, 2))->whereYear('created_at', substr($period, 0, 4))->where('status', 'approved')->count(),
            'pending' => FypReport::whereMonth('created_at', substr($period, 5, 2))->whereYear('created_at', substr($period, 0, 4))->where('status', 'pending')->count(),
            'rejected' => FypReport::whereMonth('created_at', substr($period, 5, 2))->whereYear('created_at', substr($period, 0, 4))->where('status', 'rejected')->count(),
        ];

        // ── Kehadiran bulanan ──
        $attendanceSummary = [
            'hadir' => Attendance::whereMonth('date', substr($period, 5, 2))->whereYear('date', substr($period, 0, 4))->where('status', 'hadir')->count(),
            'izin' => Attendance::whereMonth('date', substr($period, 5, 2))->whereYear('date', substr($period, 0, 4))->where('status', 'izin')->count(),
            'sakit' => Attendance::whereMonth('date', substr($period, 5, 2))->whereYear('date', substr($period, 0, 4))->where('status', 'sakit')->count(),
            'alfa' => Attendance::whereMonth('date', substr($period, 5, 2))->whereYear('date', substr($period, 0, 4))->where('status', 'alfa')->count(),
        ];

        // ── Aktivitas 7 hari ──
        $recentActivity = AuditLog::with('user')
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Performance/Index', compact(
            'rekap', 'themeDistribution', 'fypStatus', 'attendanceSummary', 'recentActivity', 'period'
        ));
    }
}
