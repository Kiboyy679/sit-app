<?php
namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with(['user', 'auditable']);

        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        if ($request->filled('action')) $query->where('action', 'like', '%' . $request->action . '%');
        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('created_at', '<=', $request->date_to);

        $logs = $query->latest()->paginate(20)->withQueryString();
        $users = \App\Models\User::orderBy('name')->get();

        return Inertia::render('Audit/Index', compact('logs', 'users'));
    }
}
