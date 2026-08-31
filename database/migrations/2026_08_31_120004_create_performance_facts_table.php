<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('performance_facts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('period', 7); // YYYY-MM
            $table->string('unit_code')->nullable();
            $table->string('task')->nullable();
            $table->string('platform')->nullable();
            $table->unsignedInteger('content_count')->default(0);
            $table->unsignedBigInteger('total_views')->default(0);
            $table->unsignedBigInteger('total_comments')->default(0);
            $table->unsignedSmallInteger('unique_identities')->default(0);
            $table->decimal('composite_score', 8, 2)->nullable();
            $table->timestamp('calculated_at')->useCurrent();

            $table->index(['user_id', 'period']);
            $table->index('period');
        });
    }
    public function down(): void {
        Schema::dropIfExists('performance_facts');
    }
};