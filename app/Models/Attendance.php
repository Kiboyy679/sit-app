<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'date', 'status', 'flags', 'notes', 'leave_request_id', 'recorded_by'];

    protected function casts(): array {
        return ['date' => 'date', 'flags' => 'array'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function leaveRequest() { return $this->belongsTo(LeaveRequest::class); }
    public function recorder() { return $this->belongsTo(User::class, 'recorded_by'); }
}
