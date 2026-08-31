<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FypReport extends Model
{
    protected $fillable = [
        'user_id', 'theme_id', 'platform', 'original_url', 'canonical_url',
        'content_key', 'post_type', 'impressions', 'engagements',
        'evidence_path', 'status', 'reviewer_id', 'rejection_reason',
        'engagement_exceeds_views',
    ];

    protected function casts(): array {
        return ['impressions' => 'integer', 'engagements' => 'integer', 'engagement_exceeds_views' => 'boolean'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function theme() { return $this->belongsTo(Theme::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewer_id'); }

    // Scope
    public function scopePending($q) { return $q->where('status', 'pending'); }
    public function scopeApproved($q) { return $q->where('status', 'approved'); }
    public function scopeRejected($q) { return $q->where('status', 'rejected'); }
}
