<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportBatch extends Model
{
    protected $fillable = ['filename', 'file_path', 'file_hash', 'period', 'column_mapping', 'total_rows', 'row_counts_by_flag', 'status', 'imported_by'];

    protected function casts(): array {
        return ['column_mapping' => 'array', 'row_counts_by_flag' => 'array'];
    }

    public function importer() { return $this->belongsTo(User::class, 'imported_by'); }
    public function rows() { return $this->hasMany(ImportRow::class); }

    public function scopeCommitted($q) { return $q->where('status', 'committed'); }
}
