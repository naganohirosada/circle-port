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
        Schema::create('project_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('creator_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            // 10: 通常ニュース, 20: 進捗報告, 30: 期間延長通知
            $table->integer('type')->default(10); 
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes(); // 憲法：論理削除
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_announcements');
    }
};
