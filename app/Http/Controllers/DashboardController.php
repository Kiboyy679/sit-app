<?php

namespace App\Http\Controllers;

use App\Models\{ContentReport, FypReport, LeaveRequest, Attendance};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $period = now()->format('Y-m');

        if ($user->hasRole('super_admin')) {
            return $this->superAdminDashboard($period);
        }
        if ($user->hasRole('admin_konten')) {
            return $this->adminKontenDashboard($period);
        }
        if ($user->hasRole('admin_fyp')) {
            return $this->adminFypDashboard($period);
        }
        if ($user->hasRole('admin_absensi')) {
            return $this->adminAbsensiDashboard($period);
        }
        return $this->karyawanDashboard($user, $period);
    }

    private function superAdminDashboard(string $period)
    {
        $stats = [
            'content_count' => ContentReport::where('period', $period)->sum('file_count'),
            'total_views' => ContentReport::where('period', $period)->sum('views'),
            'fyp_approved' => FypReport::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'fyp_pending' => FypReport::where('status', 'pending')->count(),
            'leaves_pending' => LeaveRequest::where('status', 'pending')->count(),
            'total_karyawan' => \App\Models\User::where('is_active', true)->where('employee_code', null)->count(),
        ];

        return Inertia::render('Dashboard', ['stats' => $stats, 'role' => 'super_admin']);
    }

    private function adminKontenDashboard(string $period)
    {
        $stats = [
            'content_count' => ContentReport::where('period', $period)->sum('file_count'),
            'total_views' => ContentReport::where('period', $period)->sum('views'),
            'recent_content' => ContentReport::with(['user', 'theme'])->where('period', $period)->latest()->take(5)->get(),
        ];
        return Inertia::render('Dashboard', ['stats' => $stats, 'role' => 'admin_konten']);
    }

    private function adminFypDashboard(string $period)
    {
        $stats = [
            'fyp_pending' => FypReport::where('status', 'pending')->count(),
            'fyp_approved' => FypReport::where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'fyp_rejected' => FypReport::where('status', 'rejected')->whereMonth('created_at', now()->month)->count(),
            'recent_fyp' => FypReport::with(['user', 'theme'])->latest()->take(5)->get(),
        ];
        return Inertia::render('Dashboard', ['stats' => $stats, 'role' => 'admin_fyp']);
    }

    private function adminAbsensiDashboard(string $period)
    {
        $stats = [
            'leaves_pending' => LeaveRequest::where('status', 'pending')->count(),
            'hadir_today' => Attendance::whereDate('date', today())->where('status', 'hadir')->count(),
            'alfa_today' => Attendance::whereDate('date', today())->where('status', 'alfa')->count(),
        ];
        return Inertia::render('Dashboard', ['stats' => $stats, 'role' => 'admin_absensi']);
    }

    private function karyawanDashboard($user, string $period)
    {
        $stats = [
            'content_count' => ContentReport::where('user_id', $user->id)->where('period', $period)->sum('file_count'),
            'total_views' => ContentReport::where('user_id', $user->id)->where('period', $period)->sum('views'),
            'fyp_approved' => FypReport::where('user_id', $user->id)->where('status', 'approved')->whereMonth('created_at', now()->month)->count(),
            'fyp_pending' => FypReport::where('user_id', $user->id)->where('status', 'pending')->count(),
            'leaves_pending' => LeaveRequest::where('user_id', $user->id)->where('status', 'pending')->count(),
            'recent_content' => ContentReport::where('user_id', $user->id)->where('period', $period)->latest()->take(5)->get(),
            'recent_fyp' => FypReport::where('user_id', $user->id)->latest()->take(5)->get(),
        ];
        return Inertia::render('Dashboard', ['stats' => $stats, 'role' => 'karyawan']);
    }
}
