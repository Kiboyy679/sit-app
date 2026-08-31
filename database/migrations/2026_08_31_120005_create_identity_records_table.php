<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('identity_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('normalized_identity'); // lowercase, alphanumerik
            $table->string('display_name');
            $table->string('platform')->nullable();
            $table->timestamp('first_seen')->nullable();
            $table->timestamp('last_seen')->nullable();
            $table->unsignedInteger('post_count')->default(0);
            $table->json('flags')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'normalized_identity']);
            $table->unique(['user_id', 'normalized_identity', 'platform']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('identity_records');
    }
};