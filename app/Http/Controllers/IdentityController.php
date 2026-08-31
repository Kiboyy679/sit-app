<?php
namespace App\Http\Controllers;

use App\Models\{Identity, IdentityRecord, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use Inertia\Inertia;

class IdentityController extends Controller
{
    public function index(Request $request)
    {
        $query = Identity::query();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('brand', 'like', "%{$s}%")
                  ->orWhere('platform', 'like', "%{$s}%")
                  ->orWhere('account_handle', 'like', "%{$s}%");
            });
        }
        if ($request->filled('platform')) $query->where('platform', $request->platform);
        if ($request->filled('brand')) $query->where('brand', $request->brand);
        $identities = $query->orderBy('name')->paginate(20)->withQueryString();
        $brands = Identity::distinct()->pluck('brand')->filter()->sort()->values();
        return Inertia::render('Identity/Index', compact('identities', 'brands'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'brand' => 'required|string|max:255',
                'platform' => 'required|in:tiktok,instagram,youtube,facebook,x,threads',
                'account_handle' => 'required|string|max:255',
            ]);
            Identity::create($validated);
            AuditLog::create([
                'user_id' => Auth::id(), 'action' => 'identity_create',
                'auditable_type' => Identity::class, 'auditable_id' => 0,
                'new_values' => $validated, 'ip_address' => $request->ip(),
            ]);
            return back()->with('success', 'Identitas berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['name' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Identity $identity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'platform' => 'required|in:tiktok,instagram,youtube,facebook,x,threads',
            'account_handle' => 'required|string|max:255',
        ]);
        $old = $identity->toArray();
        $identity->update($validated);
        AuditLog::create([
            'user_id' => Auth::id(), 'action' => 'identity_update',
            'auditable_type' => Identity::class, 'auditable_id' => $identity->id,
            'old_values' => $old, 'new_values' => $validated, 'ip_address' => $request->ip(),
        ]);
        return back()->with('success', 'Identitas berhasil diperbarui.');
    }

    public function destroy(Identity $identity)
    {
        $identity->delete();
        return back()->with('success', 'Identitas berhasil dihapus.');
    }

    public function detail(Identity $identity)
    {
        $records = IdentityRecord::where('identity_id', $identity->id)
            ->orderByDesc('record_date')->paginate(10);
        return Inertia::render('Identity/Detail', compact('identity', 'records'));
    }

    public function storeRecord(Request $request, Identity $identity)
    {
        $validated = $request->validate([
            'record_date' => 'required|date',
            'impressions' => 'nullable|integer|min:0',
            'engagements' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);
        $validated['identity_id'] = $identity->id;
        IdentityRecord::create($validated);
        return back()->with('success', 'Data identitas berhasil ditambahkan.');
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'source_id' => 'required|exists:identities,id',
            'target_id' => 'required|exists:identities,id',
        ]);
        if ($validated['source_id'] === $validated['target_id']) {
            return back()->withErrors(['source_id' => 'Sumber dan tujuan tidak boleh sama.']);
        }
        $source = Identity::find($validated['source_id']);
        $target = Identity::find($validated['target_id']);
        IdentityRecord::where('identity_id', $source->id)->update(['identity_id' => $target->id]);
        $source->delete();
        return back()->with('success', 'Identitas berhasil digabungkan.');
    }
}
