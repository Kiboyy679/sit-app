<?php
namespace App\Http\Controllers;

use App\Services\CsvImportService;
use App\Models\{ImportBatch, ImportRow, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Storage};
use Inertia\Inertia;

class ImportController extends Controller
{
    public function __construct(
        private CsvImportService $importService
    ) {}

    public function index()
    {
        $batches = ImportBatch::with('uploader')->latest()->paginate(15);
        return Inertia::render('Import/Index', compact('batches'));
    }

    /**
     * IMP-01/02: Upload + auto-detect headers
     */
    public function upload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('csv_file');
        $path = $file->store('imports/' . Auth::id(), 'local');
        $fullPath = storage_path('app/' . $path);

        $parsed = $this->importService->parseFile($fullPath);

        $batch = ImportBatch::create([
            'uploader_id' => Auth::id(),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'total_rows' => $parsed['total_rows'],
            'detected_mapping' => $parsed['mapping'],
            'status' => 'uploaded',
        ]);

        return redirect()->route('import.preview', $batch);
    }

    /**
     * Show preview/mapping page for a batch
     */
    public function preview(ImportBatch $batch)
    {
        $fullPath = storage_path('app/' . $batch->file_path);
        if (!file_exists($fullPath)) {
            return back()->withErrors(['batch' => 'File CSV tidak ditemukan.']);
        }
        $parsed = $this->importService->parseFile($fullPath);
        $headers = $parsed['headers'];
        $sampleRows = $parsed['sample'];
        $detectedMapping = $batch->detected_mapping ?? $parsed['mapping'];
        return Inertia::render('Import/Preview', compact('batch', 'headers', 'sampleRows', 'detectedMapping'));
    }

    /**
     * IMP-03..08: Process with (possibly adjusted) mapping
     */
    public function process(Request $request, ImportBatch $batch)
    {
        $validated = $request->validate([
            'mapping' => 'required|array',
        ]);

        $fullPath = storage_path('app/' . $batch->file_path);
        $result = $this->importService->processRows($fullPath, $validated['mapping']);

        $batch->update([
            'status' => 'processed',
            'detected_mapping' => $validated['mapping'],
            'valid_rows' => $result['stats']['valid'],
            'invalid_rows' => $result['stats']['invalid'],
            'anomaly_count' => $result['stats']['anomalies'],
        ]);

        // Store rows temporarily in session for review
        $request->session()->put('import_rows_' . $batch->id, $result['rows']);

        return Inertia::render('Import/Review', [
            'batch' => $batch,
            'rows' => $result['rows'],
            'stats' => $result['stats'],
            'anomalies' => $result['anomalies'],
        ]);
    }

    /**
     * IMP-09: Skip individual rows
     */
    public function skipRow(Request $request, ImportBatch $batch)
    {
        $validated = $request->validate(['row_index' => 'required|integer']);
        $sessionKey = 'import_rows_' . $batch->id;
        $rows = $request->session()->get($sessionKey, []);

        if (isset($rows[$validated['row_index']])) {
            $rows[$validated['row_index']]['status'] = 'skipped';
            $request->session()->put($sessionKey, $rows);
        }

        return back()->with('success', 'Baris berhasil dilewati.');
    }

    /**
     * IMP-09: Commit valid rows to database
     */
    public function commit(Request $request, ImportBatch $batch)
    {
        $sessionKey = 'import_rows_' . $batch->id;
        $rows = $request->session()->get($sessionKey, []);

        if (empty($rows)) {
            return back()->withErrors(['batch' => 'Tidak ada baris untuk di-commit.']);
        }

        $period = now()->format('Y-m');
        $result = $this->importService->commitRows($rows, Auth::id(), $period);

        $batch->update([
            'status' => 'committed',
            'committed_rows' => $result['committed'],
            'skipped_rows' => $result['skipped'],
            'committed_at' => now(),
        ]);

        $request->session()->forget($sessionKey);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'csv_commit',
            'auditable_type' => ImportBatch::class,
            'auditable_id' => $batch->id,
            'new_values' => [
                'committed' => $result['committed'],
                'skipped' => $result['skipped'],
                'file_name' => $batch->file_name,
            ],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('import.index')
            ->with('success', "Import selesai: {$result['committed']} baris berhasil, {$result['skipped']} dilewati.");
    }

    /**
     * IMP-09: Delete batch + undo
     */
    public function destroy(ImportBatch $batch)
    {
        if ($batch->status === 'committed') {
            // Delete all FYP reports created from this batch's import
            // (simplified: delete by uploader + recent timeframe)
            \App\Models\FypReport::where('user_id', $batch->uploader_id)
                ->where('status', 'pending')
                ->where('created_at', '>=', $batch->created_at)
                ->delete();
        }

        $batch->delete();
        return back()->with('success', 'Batch import berhasil dihapus.');
    }
}
