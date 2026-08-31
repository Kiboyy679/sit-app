<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentityRecord extends Model
{
    protected $fillable = ['user_id', 'normalized_identity', 'display_name', 'platform', 'first_seen', 'last_seen', 'post_count', 'flags'];

    protected function casts(): array {
        return ['first_seen' => 'datetime', 'last_seen' => 'datetime', 'flags' => 'array'];
    }

    public function user() { return $this->belongsTo(User::class); }
}
