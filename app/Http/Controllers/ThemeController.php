<?php
namespace App\Http\Controllers;

use App\Models\Theme;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThemeController extends Controller
{
    public function index()
    {
        $themes = Theme::orderBy('is_canonical', 'desc')->orderBy('name')->get();
        return Inertia::render('Admin/Themes', compact('themes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $normalized = strtolower(preg_replace('/[^a-z0-9]/i', '', $validated['name']));
        $validated['normalized'] = $normalized;
        $validated['is_canonical'] = true;
        $validated['usage_count'] = 0;
        Theme::create($validated);
        return back()->with('success', 'Tema berhasil ditambahkan.');
    }

    public function update(Request $request, Theme $theme)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $normalized = strtolower(preg_replace('/[^a-z0-9]/i', '', $validated['name']));
        $theme->update(['name' => $validated['name'], 'normalized' => $normalized, 'is_canonical' => true]);
        return back()->with('success', 'Tema berhasil diperbarui.');
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'source_id' => 'required|exists:themes,id',
            'target_id' => 'required|exists:themes,id',
        ]);
        if ($validated['source_id'] === $validated['target_id']) {
            return back()->withErrors(['source_id' => 'Tema sumber dan tujuan tidak boleh sama.']);
        }
        $source = Theme::find($validated['source_id']);
        $target = Theme::find($validated['target_id']);

        // Update all reports that use source theme
        \App\Models\ContentReport::where('theme_id', $source->id)->update(['theme_id' => $target->id]);
        \App\Models\FypReport::where('theme_id', $source->id)->update(['theme_id' => $target->id]);

        $target->increment('usage_count', $source->usage_count);
        $source->delete();

        return back()->with('success', 'Tema berhasil digabungkan.');
    }

    public function approve(Theme $theme)
    {
        $theme->update(['is_canonical' => true]);
        return back()->with('success', 'Tema berhasil disetujui.');
    }

    public function destroy(Theme $theme)
    {
        $theme->delete();
        return back()->with('success', 'Tema berhasil dihapus.');
    }
}
