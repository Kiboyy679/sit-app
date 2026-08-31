<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->date('date');
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alfa', 'dinas_luar', 'tugas_luar'])->default('hadir');
            $table->json('flags')->nullable(); // terlambat, pulang cepat, lembur, pindah shift
            $table->text('notes')->nullable();
            $table->foreignId('leave_request_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'date']);
            $table->index(['user_id', 'date']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('attendances');
    }
};