<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('normalized'); // lowercase, alphanumerik
            $table->boolean('is_canonical')->default(false); // true = data induk, false = calon tema
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
            $table->unique('normalized');
        });
    }
    public function down(): void {
        Schema::dropIfExists('themes');
    }
};