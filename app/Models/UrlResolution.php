<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UrlResolution extends Model
{
    protected $fillable = ['share_url', 'canonical_url', 'content_key', 'owner_identity', 'resolved_at', 'attempts', 'last_error'];

    protected function casts(): array {
        return ['resolved_at' => 'datetime'];
    }
}
