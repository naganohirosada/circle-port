<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hs_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // 例: 6912.00
            $table->string('name_ja'); // 陶磁器製の食卓用品
            $table->string('name_en'); // Ceramic tableware
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hs_codes');
    }
};
