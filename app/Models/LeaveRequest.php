<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = ['user_id', 'start_date', 'end_date', 'type', 'description', 'evidence_path', 'status', 'approver_id', 'rejection_reason'];

    protected function casts(): array {
        return ['start_date' => 'date', 'end_date' => 'date'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function approver() { return $this->belongsTo(User::class, 'approver_id'); }

    public function scopePending($q) { return $q->where('status', 'pending'); }
}
