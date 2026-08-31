<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentReport extends Model
{
    protected $fillable = ['user_id', 'theme_id', 'report_date', 'period', 'views', 'views_updated_at', 'file_count'];

    protected function casts(): array {
        return ['report_date' => 'date', 'views_updated_at' => 'datetime'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function theme() { return $this->belongsTo(Theme::class); }
    public function media() { return $this->hasMany(ContentMedia::class); }
}
