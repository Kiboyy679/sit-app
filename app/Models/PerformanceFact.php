<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceFact extends Model
{
    protected $fillable = ['user_id', 'period', 'unit_code', 'task', 'platform', 'content_count', 'total_views', 'total_comments', 'unique_identities', 'composite_score'];

    protected function casts(): array {
        return ['composite_score' => 'decimal:2'];
    }

    public function user() { return $this->belongsTo(User::class); }

    public function scopeForPeriod($q, string $period) { return $q->where('period', $period); }
}
