<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('file_path');
            $table->string('file_hash', 64)->unique(); // anti duplikat
            $table->string('period', 7); // YYYY-MM, ditetapkan manual
            $table->json('column_mapping')->nullable();
            $table->unsignedInteger('total_rows')->default(0);
            $table->json('row_counts_by_flag')->nullable(); // jumlah per jenis penanda
            $table->enum('status', ['uploaded', 'resolving', 'review', 'committed', 'cancelled'])->default('uploaded');
            $table->foreignId('imported_by')->constrained('users');
            $table->timestamps();

            $table->index('status');
            $table->index('period');
        });
    }
    public function down(): void {
        Schema::dropIfExists('import_batches');
    }
};