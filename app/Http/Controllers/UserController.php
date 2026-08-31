<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, DB};
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->orderBy('name')->get();
        $roles = Role::all();
        return Inertia::render('Admin/Users', compact('users', 'roles'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'unit' => 'nullable|string|max:255',
            'role' => 'required|exists:roles,name',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                ...$validated,
                'password' => Hash::make($validated['password']),
                'is_active' => true,
            ]);
            $user->assignRole($validated['role']);
            DB::commit();
            return back()->with('success', 'Pengguna berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['email' => 'Gagal menambahkan pengguna: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'unit' => 'nullable|string|max:255',
            'role' => 'required|exists:roles,name',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'unit' => $validated['unit'] ?? $user->unit,
                'is_active' => $validated['is_active'] ?? $user->is_active,
            ]);
            $user->syncRoles([$validated['role']]);
            DB::commit();
            return back()->with('success', 'Pengguna berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['email' => 'Gagal memperbarui: ' . $e->getMessage()]);
        }
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user->update(['password' => Hash::make($validated['password'])]);
        return back()->with('success', 'Kata sandi berhasil diatur ulang.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
