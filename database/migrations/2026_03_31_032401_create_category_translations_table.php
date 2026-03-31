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
        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            // foreignId で親テーブルと紐付け（削除時は連動して消える設定）
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('locale')->index(); // 'ja', 'en', 'th' など
            $table->string('name');            // カテゴリー名
            $table->timestamps();

            // 同じカテゴリーで同じ言語が2つ存在しないように制約をかける
            $table->unique(['category_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_translations');
    }
};
