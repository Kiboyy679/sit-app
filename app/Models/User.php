<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = ['name', 'email', 'password', 'unit', 'employee_code', 'is_active'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // --- Relasi Subsistem A ---
    public function aliases() { return $this->hasMany(UserAlias::class); }
    public function contentReports() { return $this->hasMany(ContentReport::class); }
    public function fypReports() { return $this->hasMany(FypReport::class); }
    public function leaveRequests() { return $this->hasMany(LeaveRequest::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }
    public function auditLogs() { return $this->hasMany(AuditLog::class); }

    // --- Relasi Subsistem B ---
    public function importBatches() { return $this->hasMany(ImportBatch::class, 'imported_by'); }
    public function performanceFacts() { return $this->hasMany(PerformanceFact::class); }
    public function identityRecords() { return $this->hasMany(IdentityRecord::class); }

    // --- Helper ---
    public function isActive(): bool { return $this->is_active; }
}
