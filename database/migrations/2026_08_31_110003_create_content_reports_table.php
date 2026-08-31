<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('theme_id')->nullable()->constrained()->nullOnDelete();
            $table->date('report_date'); // server-set, bukan user
            $table->string('period', 7); // YYYY-MM
            $table->unsignedInteger('views')->default(0);
            $table->timestamp('views_updated_at')->nullable();
            $table->unsignedSmallInteger('file_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'period']);
            $table->index(['theme_id', 'report_date']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('content_reports');
    }
};