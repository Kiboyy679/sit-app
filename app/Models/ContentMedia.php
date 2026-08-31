<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentMedia extends Model
{
    protected $fillable = ['content_report_id', 'file_path', 'file_type', 'file_size', 'file_hash', 'thumbnail_path', 'archived_at', 'archive_path'];

    protected function casts(): array {
        return ['archived_at' => 'datetime', 'file_size' => 'integer'];
    }

    public function report() { return $this->belongsTo(ContentReport::class, 'content_report_id'); }
}
