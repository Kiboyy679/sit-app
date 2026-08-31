<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContentApiController extends Controller
{
    public function uploadChunk(Request $request)
    {
        // For large files: chunked upload
        $request->validate([
            'chunk' => 'required|file',
            'upload_id' => 'required|string',
            'chunk_number' => 'required|integer',
            'total_chunks' => 'required|integer',
        ]);

        $chunkPath = storage_path('app/temp_chunks/' . $request->upload_id);
        if (!is_dir($chunkPath)) mkdir($chunkPath, 0755, true);
        $request->file('chunk')->move($chunkPath, $request->chunk_number);

        $uploadedChunks = count(glob($chunkPath . '/*'));
        $complete = $uploadedChunks >= $request->total_chunks;

        if ($complete) {
            // Merge chunks
            $ext = pathinfo($request->filename ?? 'file', PATHINFO_EXTENSION);
            $finalPath = $chunkPath . '.' . $ext;
            $out = fopen($finalPath, 'w');
            for ($i = 1; $i <= $request->total_chunks; $i++) {
                $chunk = fopen($chunkPath . '/' . $i, 'r');
                stream_copy_to_stream($chunk, $out);
                fclose($chunk);
            }
            fclose($out);
            // Cleanup chunks
            array_map('unlink', glob($chunkPath . '/*'));
            rmdir($chunkPath);
        }

        return response()->json([
            'complete' => $complete,
            'uploaded' => $uploadedChunks,
            'total' => $request->total_chunks,
        ]);
    }
}
