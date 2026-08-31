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

        $query = Attendance::with(['user', 'recorder']);
        $query->whereMonth('date', substr($month, 5, 2))
              ->whereYear('date', substr($month, 0, 4));

        if ($user->hasRole('karyawan')) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('user_id') && $user->hasRole(['super_admin', 'admin_absensi'])) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) $query->where('status', $request->status);

        $attendances = $query->orderBy('date')->get();

        // Monthly summary per user
        $users = $user->hasRole(['super_admin', 'admin_absensi'])
            ? User::where('is_active', true)->orderBy('name')->get()
            : collect([$user]);

        $summary = [];
        foreach ($users as $u) {
            $summary[$u->id] = [
                'name' => $u->name,
                'hadir' => Attendance::where('user_id', $u->id)->whereMonth('date', substr($month, 5, 2))
                    ->whereYear('date', substr($month, 0, 4))->where('status', 'hadir')->count(),
                'izin' => Attendance::where('user_id', $u->id)->whereMonth('date', substr($month, 5, 2))
                    ->whereYear('date', substr($month, 0, 4))->where('status', 'izin')->count(),
                'sakit' => Attendance::where('user_id', $u->id)->whereMonth('date', substr($month, 5, 2))
                    ->whereYear('date', substr($month, 0, 4))->where('status', 'sakit')->count(),
                'alfa' => Attendance::where('user_id', $u->id)->whereMonth('date', substr($month, 5, 2))
                    ->whereYear('date', substr($month, 0, 4))->where('status', 'alfa')->count(),
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
            $csv .= '"' . $a->user->name . '","' . $a->date->format('Y-m-d') . '","' . $a->status . '","' . $flags . '"\n';
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="kehadiran_' . $month . '.csv"',
        ]);
    }
}
