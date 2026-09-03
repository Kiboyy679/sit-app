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
        $monthNum = substr($period, 5, 2);
        $yearNum  = substr($period, 0, 4);

        $karyawans = User::where('is_active', true)
            ->whereNull('employee_code')
            ->orderBy('name')
            ->get();
        $kIds = $karyawans->pluck('id')->toArray();

        // ── Bulk content stats ──
        $contentStats = ContentReport::select(
                'user_id',
                DB::raw('COALESCE(SUM(file_count),0) as content_count'),
                DB::raw('COALESCE(SUM(views),0) as total_views')
            )
            ->whereIn('user_id', $kIds)
            ->where('period', $period)
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        // ── Bulk FYP stats ──
        $fypStats = FypReport::select(
                'user_id', 'status',
                DB::raw('count(*) as cnt')
            )
            ->whereIn('user_id', $kIds)
            ->whereMonth('created_at', $monthNum)
            ->whereYear('created_at', $yearNum)
            ->groupBy('user_id', 'status')
            ->get()
            ->groupBy('user_id');

        // ── Bulk attendance stats ──
        $attStats = Attendance::select(
                'user_id', 'status',
                DB::raw('count(*) as cnt')
            )
            ->whereIn('user_id', $kIds)
            ->whereMonth('date', $monthNum)
            ->whereYear('date', $yearNum)
            ->groupBy('user_id', 'status')
            ->get()
            ->groupBy('user_id');

        // ── Bulk leave pending ──
        $leavePending = LeaveRequest::select('user_id', DB::raw('count(*) as cnt'))
            ->whereIn('user_id', $kIds)
            ->where('status', 'pending')
            ->groupBy('user_id')
            ->pluck('cnt', 'user_id');

        // ── Build rekap ──
        $rekap = $karyawans->map(function ($k) use ($contentStats, $fypStats, $attStats, $leavePending) {
            $cs = $contentStats->get($k->id);
            $contentCount = $cs->content_count ?? 0;
            $totalViews   = $cs->total_views ?? 0;

            $fRows = $fypStats->get($k->id, collect());
            $fypApproved = 0; $fypPending = 0; $fypRejected = 0;
            foreach ($fRows as $fr) {
                if ($fr->status === 'approved') $fypApproved = $fr->cnt;
                elseif ($fr->status === 'pending')  $fypPending = $fr->cnt;
                elseif ($fr->status === 'rejected') $fypRejected = $fr->cnt;
            }

            $aRows = $attStats->get($k->id, collect());
            $hadir = 0; $alfa = 0;
            foreach ($aRows as $ar) {
                if ($ar->status === 'hadir') $hadir = $ar->cnt;
                elseif ($ar->status === 'alfa') $alfa = $ar->cnt;
            }

            $leavesPending = $leavePending->get($k->id, 0);

            $contentScore = min($contentCount * 2, 40);
            $viewsScore   = min(floor($totalViews / 1000) * 5, 30);
            $fypScore     = min($fypApproved * 3, 20);
            $absenScore   = ($hadir + $alfa) > 0 ? round(($hadir / ($hadir + $alfa)) * 10, 0) : 10;
            $score = $contentScore + $viewsScore + $fypScore + $absenScore;

            return [
                'name'          => $k->name,
                'unit'          => $k->unit,
                'content_count' => $contentCount,
                'total_views'   => $totalViews,
                'fyp_approved'  => $fypApproved,
                'fyp_pending'   => $fypPending,
                'fyp_rejected'  => $fypRejected,
                'hadir'         => $hadir,
                'alfa'          => $alfa,
                'leaves_pending'=> $leavesPending,
                'score'         => $score,
            ];
        })->sortByDesc('score')->values();

        // ── Distribusi tema ──
        $themeDistribution = Theme::where('is_canonical', true)
            ->select('name', 'usage_count')
            ->orderByDesc('usage_count')
            ->get();

        // ── Status FYP (bulk) ──
        $fypTotals = FypReport::select('status', DB::raw('count(*) as cnt'))
            ->whereMonth('created_at', $monthNum)
            ->whereYear('created_at', $yearNum)
            ->groupBy('status')
            ->pluck('cnt', 'status');
        $fypStatus = [
            'approved' => $fypTotals->get('approved', 0),
            'pending'  => $fypTotals->get('pending', 0),
            'rejected' => $fypTotals->get('rejected', 0),
        ];

        // ── Kehadiran bulanan (bulk) ──
        $attTotals = Attendance::select('status', DB::raw('count(*) as cnt'))
            ->whereMonth('date', $monthNum)
            ->whereYear('date', $yearNum)
            ->groupBy('status')
            ->pluck('cnt', 'status');
        $attendanceSummary = [
            'hadir' => $attTotals->get('hadir', 0),
            'izin'  => $attTotals->get('izin', 0),
            'sakit' => $attTotals->get('sakit', 0),
            'alfa'  => $attTotals->get('alfa', 0),
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
