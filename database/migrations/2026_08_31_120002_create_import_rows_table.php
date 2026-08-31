<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('import_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_batch_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->json('raw_data'); // isi baris asli
            $table->timestamp('source_time')->nullable();
            $table->foreignId('matched_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('unit_code')->nullable();
            $table->string('task')->nullable();
            $table->string('platform_detected')->nullable();
            $table->text('canonical_url')->nullable();
            $table->string('content_key')->nullable();
            $table->string('owner_identity')->nullable(); // akun pemilik dari URL
            $table->string('reported_identity')->nullable(); // identitas dari berkas
            $table->unsignedBigInteger('views')->nullable();
            $table->unsignedBigInteger('comments')->nullable();
            $table->json('flags')->nullable(); // array flag penanda anomali
            $table->enum('decision', ['pending', 'accepted', 'skipped'])->default('pending');
            $table->timestamps();

            $table->index(['import_batch_id', 'decision']);
            $table->index('content_key');
        });
    }
    public function down(): void {
        Schema::dropIfExists('import_rows');
    }
};