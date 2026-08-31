<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Identity extends Model
{
    protected $fillable = ['name', 'brand', 'platform', 'account_handle'];
}
