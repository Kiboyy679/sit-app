<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('identities', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // nama tampil
            $table->string('brand')->nullable();
            $table->string('platform')->nullable();
            $table->string('account_handle')->nullable();
            $table->timestamps();

            $table->index('platform');
        });
    }
    public function down(): void {
        Schema::dropIfExists('identities');
    }
};