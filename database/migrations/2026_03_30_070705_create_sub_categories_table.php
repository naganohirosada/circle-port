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
        Schema::create('sub_categories', function (Blueprint $table) {
            $table->id();
            // 親カテゴリへのリレーション
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            
            // カテゴリ名（もちろん多言語対応の準備として ja を付けておきます）
            $table->string('name_ja');
            $table->string('name_en')->nullable();
            
            // 並び順などを制御したい場合に便利
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_categories');
    }
};
