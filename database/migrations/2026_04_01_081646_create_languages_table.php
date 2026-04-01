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
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 5)->unique(); // ja, en, zh...
            $table->string('name');              // 日本語, English...
            $table->string('native_name');       // 読み込み用（任意）
            $table->tinyInteger('status')->default(1); // 1:有効, 0:無効
            $table->integer('sort_order')->default(0); // 表示順
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('languages');
    }
};
