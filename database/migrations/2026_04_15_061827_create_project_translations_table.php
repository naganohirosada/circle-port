<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_translations', function (Blueprint $table) {
            $table->id();
            // 親プロジェクトへの参照
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            // 言語コード (ja, en, etc.)
            $table->string('locale')->index();
            
            // 翻訳対象のテキスト情報
            $table->string('title');
            $table->text('description')->nullable();

            $table->timestamps();

            // 同じプロジェクトで同じ言語が重複しないようにユニーク制約
            $table->unique(['project_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_translations');
    }
};