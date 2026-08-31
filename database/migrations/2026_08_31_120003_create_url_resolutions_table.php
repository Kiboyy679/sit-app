<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('url_resolutions', function (Blueprint $table) {
            $table->id();
            $table->string('share_url', 2048);
            $table->text('canonical_url')->nullable();
            $table->string('content_key')->nullable();
            $table->string('owner_identity')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index('content_key');
        });
    }
    public function down(): void {
        Schema::dropIfExists('url_resolutions');
    }
};
