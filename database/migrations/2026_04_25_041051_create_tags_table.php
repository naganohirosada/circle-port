<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('name')->unique(); // タグ名（#猫、#サイバーパンク等）
            $blueprint->string('slug')->unique(); // URL用（cat, cyberpunk等）
            $blueprint->boolean('is_active')->default(true); // 表示・非表示
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
