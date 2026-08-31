<?php
namespace App\Http\Controllers;

use App\Models\{LeaveRequest, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = LeaveRequest::with(['user', 'approver']);

        if ($user->hasRole('karyawan')) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('user_id') && $user->hasRole(['super_admin', 'admin_absensi'])) {
            $query->where('user_id', $request->user_id);
        }

        $leaves = $query->latest()->paginate(15)->withQueryString();
        $stats = [
            'pending' => LeaveRequest::where('status', 'pending')
                ->when($user->hasRole('karyawan'), fn($q) => $q->where('user_id', $user->id))->count(),
            'approved' => LeaveRequest::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'rejected' => LeaveRequest::where('status', 'rejected')->whereMonth('created_at', now()->month)->count(),
        ];

        $karyawanList = $user->hasRole(['super_admin', 'admin_absensi'])
            ? \App\Models\User::orderBy('name')->get()
            : collect();

        return Inertia::render('Leave/Index', compact('leaves', 'stats', 'karyawanList'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:izin,sakit,cuti,dinas_luar,lainnya',
            'description' => 'required|string|max:500',
        ]);

        // Check overlapping leave
        $overlapping = LeaveRequest::where('user_id', Auth::id())
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhere(function ($q2) use ($validated) {
                      $q2->where('start_date', '<=', $validated['start_date'])
                        ->where('end_date', '>=', $validated['end_date']);
                  });
            })->first();

        if ($overlapping) {
            return back()->withErrors([
                'start_date' => 'Sudah ada pengajuan izin yang tumpang tindih pada periode ini.',
            ]);
        }

        DB::beginTransaction();
        try {
            $leave = LeaveRequest::create([
                ...$validated,
                'user_id' => Auth::id(),
                'status' => 'pending',
            ]);

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'leave_submit',
                'auditable_type' => LeaveRequest::class,
                'auditable_id' => $leave->id,
                'new_values' => $validated,
                'ip_address' => $request->ip(),
            ]);

            DB::commit();
            return back()->with('success', 'Pengajuan izin berhasil dikirim.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['description' => 'Gagal mengirim: ' . $e->getMessage()]);
        }
    }

    public function review(Request $request, LeaveRequest $leave)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_note' => 'nullable|string|max:500',
        ]);

        $leave->update([
            'status' => $validated['status'],
            'approver_id' => Auth::id(),
        ]);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'leave_' . $validated['status'],
            'auditable_type' => LeaveRequest::class,
            'auditable_id' => $leave->id,
            'old_values' => ['status' => 'pending'],
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Izin berhasil ' . ($validated['status'] === 'approved' ? 'disetujui' : 'ditolak') . '.');
    }
}
