<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('country_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->string('locale', 10)->index(); // ja, en, zh, fr, th
            $table->string('name');
            $table->timestamps();

            // 同じ国で同じ言語のデータが重複しないようにユニーク制約
            $table->unique(['country_id', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('country_translations');
    }
};
