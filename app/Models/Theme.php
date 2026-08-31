<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    protected $fillable = ['name', 'normalized', 'is_canonical', 'usage_count'];

    protected function casts(): array {
        return ['is_canonical' => 'boolean', 'usage_count' => 'integer'];
    }

    // Scope: hanya tema canonical (data induk)
    public function scopeCanonical($q) { return $q->where('is_canonical', true); }
    public function scopeCandidates($q) { return $q->where('is_canonical', false); }

    public function contentReports() { return $this->hasMany(ContentReport::class); }
    public function fypReports() { return $this->hasMany(FypReport::class); }
}
