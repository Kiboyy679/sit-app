<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('content_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_report_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_type'); // jpg, jpeg, png, webp, mp4, mov
            $table->unsignedBigInteger('file_size'); // bytes
            $table->string('file_hash', 64); // SHA-256
            $table->string('thumbnail_path')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->string('archive_path')->nullable();
            $table->timestamps();

            $table->index('file_hash');
        });
    }
    public function down(): void {
        Schema::dropIfExists('content_media');
    }
};