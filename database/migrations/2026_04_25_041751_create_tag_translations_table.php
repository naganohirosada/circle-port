<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. tagsテーブルからnameを削除（翻訳テーブルへ移動するため）
        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn('name');
        });

        // 2. tag_translationsテーブルの作成
        Schema::create('tag_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->string('locale', 5)->index(); // ja, en, etc.
            $table->string('name'); // 各言語でのタグ名
            $table->timestamps();

            $table->unique(['tag_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tag_translations');
        Schema::table('tags', function (Blueprint $table) {
            $table->string('name')->after('id');
        });
    }
};
