<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fyp_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('theme_id')->nullable()->constrained()->nullOnDelete();
            $table->string('platform'); // tiktok, youtube, instagram, dll
            $table->text('original_url');
            $table->text('canonical_url')->nullable();
            $table->string('content_key')->unique(); // kunci unik hasil normalisasi
            $table->enum('post_type', ['main', 'reply', 'comment']); // unggahan utama/balasan/komentar
            $table->unsignedBigInteger('impressions')->default(0); // jangkauan
            $table->unsignedBigInteger('engagements')->default(0); // interaksi
            $table->string('evidence_path')->nullable(); // screenshot bukti
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->boolean('engagement_exceeds_views')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }
    public function down(): void {
        Schema::dropIfExists('fyp_reports');
    }
};