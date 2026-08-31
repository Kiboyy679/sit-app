<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAlias extends Model
{
    protected $fillable = ['user_id', 'alias'];

    public function user() { return $this->belongsTo(User::class); }
}
