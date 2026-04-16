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
        Schema::create('project_announcement_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_announcement_id')->constrained('project_announcements', 'id', 'pa_translations_pa_id_foreign')->onDelete('cascade');
            $table->string('locale')->index();
            $table->string('title');
            $table->text('content');
            $table->timestamps();

            $table->unique(['project_announcement_id', 'locale'], 'pa_translations_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_announcement_translations');
    }
};
