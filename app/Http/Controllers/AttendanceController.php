<?php
namespace App\Http\Controllers;

use App\Models\{Attendance, User, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $month = $request->get('month', now()->format('Y-m'));
        $monthNum = substr($month, 5, 2);
        $yearNum = substr($month, 0, 4);

        $query = Attendance::with(['user', 'recorder']);
        $query->whereMonth('date', $monthNum)
              ->whereYear('date', $yearNum);

        if ($user->hasRole('karyawan')) {
            $query->where('user_id', $user->id);
        }
        if ($request->filled('user_id') && $user->hasRole(['super_admin', 'admin_absensi'])) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) $query->where('status', $request->status);

        $attendances = $query->orderBy('date')->get();

        // Bulk summary — single query with GROUP BY instead of N×4
        $isGlobalAdmin = $user->hasRole(['super_admin', 'admin_absensi']);
        if ($isGlobalAdmin) {
            $users = User::where('is_active', true)->orderBy('name')->get();
        } else {
            $users = collect([$user]);
        }

        $userIdList = $users->pluck('id')->toArray();

        $rawSummary = Attendance::select('user_id', 'status', DB::raw('count(*) as cnt'))
            ->whereMonth('date', $monthNum)
            ->whereYear('date', $yearNum)
            ->whereIn('user_id', $userIdList)
            ->groupBy('user_id', 'status')
            ->get()
            ->groupBy('user_id');

        $summary = [];
        foreach ($users as $u) {
            $rows = $rawSummary->get($u->id, collect());
            $counts = [];
            foreach ($rows as $r) $counts[$r->status] = $r->cnt;
            $summary[$u->id] = [
                'name'   => $u->name,
                'hadir'  => $counts['hadir'] ?? 0,
                'izin'   => $counts['izin'] ?? 0,
                'sakit'  => $counts['sakit'] ?? 0,
                'alfa'   => $counts['alfa'] ?? 0,
            ];
        }

        return Inertia::render('Attendance/Index', compact('attendances', 'summary', 'month', 'users'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:hadir,izin,sakit,alfa,dinas_luar,tugas_luar',
            'flags' => 'nullable|array',
            'flags.*' => 'in:terlambat,lembur,pulang_cepat,pindah_shift',
        ]);

        $existing = Attendance::where('user_id', $validated['user_id'])
            ->whereDate('date', $validated['date'])->first();

        if ($existing) {
            $existing->update([
                'status' => $validated['status'],
                'flags' => $validated['flags'] ?? null,
                'recorded_by' => Auth::id(),
            ]);
            $leave = $existing;
        } else {
            $validated['recorded_by'] = Auth::id();
            $leave = Attendance::create($validated);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'attendance_record',
            'auditable_type' => Attendance::class,
            'auditable_id' => $leave->id,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Kehadiran berhasil dicatat.');
    }

    public function export(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $attendances = Attendance::with('user')
            ->whereMonth('date', substr($month, 5, 2))
            ->whereYear('date', substr($month, 0, 4))
            ->orderBy('date')
            ->get();

        $csv = "Nama,Tanggal,Status,Flags\n";
        foreach ($attendances as $a) {
            $flags = $a->flags ? implode('; ', $a->flags) : '';
            $csv .= '"' . $a->user->name . '","' . $a->date->format('Y-m-d') . '","' . $a->status . '","' . $flags . "\"\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="kehadiran_' . $month . '.csv"',
        ]);
    }
}
