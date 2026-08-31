<?php
namespace App\Http\Controllers;

use App\Models\{User, UserAlias};
use Illuminate\Http\Request;
use Inertia\Inertia;

class AliasController extends Controller
{
    public function index()
    {
        $aliases = UserAlias::with('user')->orderBy('alias')->get();
        $users = User::orderBy('name')->get();
        return Inertia::render('Admin/Aliases', compact('aliases', 'users'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'alias' => 'required|string|max:255|unique:user_aliases,alias',
            ]);
            UserAlias::create($validated);
            return back()->with('success', 'Alias berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['alias' => 'Gagal menambahkan alias: ' . $e->getMessage()]);
        }
    }

    public function destroy(UserAlias $alias)
    {
        $alias->delete();
        return back()->with('success', 'Alias berhasil dihapus.');
    }
}
