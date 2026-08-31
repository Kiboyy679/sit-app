<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportRow extends Model
{
    protected $fillable = [
        'import_batch_id', 'row_number', 'raw_data', 'source_time', 'matched_user_id',
        'unit_code', 'task', 'platform_detected', 'canonical_url', 'content_key',
        'owner_identity', 'reported_identity', 'views', 'comments', 'flags', 'decision',
    ];

    protected function casts(): array {
        return ['raw_data' => 'array', 'flags' => 'array', 'source_time' => 'datetime'];
    }

    public function batch() { return $this->belongsTo(ImportBatch::class); }
    public function matchedUser() { return $this->belongsTo(User::class, 'matched_user_id'); }
}
