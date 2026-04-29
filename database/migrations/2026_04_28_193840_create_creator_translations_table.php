<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creator_translations', function (Blueprint $blueprint) {
            $blueprint->id();
            // クリエイター本体への外部キー
            $blueprint->foreignId('creator_id')->constrained()->onDelete('cascade');
            // 言語コード (ja, en, ko など)
            $blueprint->string('locale')->index();
            
            // 翻訳対象のカラム
            $blueprint->string('name')->nullable(); // 名前も言語ごとに変えたい場合
            $blueprint->text('profile')->nullable(); // 自己紹介
            
            $blueprint->timestamps();

            // 同じクリエイターで同じ言語のデータが重複しないように制限
            $blueprint->unique(['creator_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creator_translations');
    }
};