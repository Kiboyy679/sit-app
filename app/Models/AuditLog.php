<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    const UPDATED_AT = null;
    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address'];

    protected function casts(): array {
        return ['old_values' => 'array', 'new_values' => 'array'];
    }

    // Audit log TIDAK BISA diubah/dihapus (no update/delete methods exposed)
    public static function boot() {
        parent::boot();
        static::updating(function () { abort(403, 'Jejak audit tidak dapat disunting.'); });
        static::deleting(function () { abort(403, 'Jejak audit tidak dapat dihapus.'); });
    }

    public function user() { return $this->belongsTo(User::class); }
    public function auditable() { return $this->morphTo(); }
}
