<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_announcements', function (Blueprint $table) {
            $table->dropColumn(['title', 'content']);
        });
    }

    public function down(): void
    {
        Schema::table('project_announcements', function (Blueprint $table) {
            // 戻す場合は再度追加（型に注意）
            $table->string('title')->after('creator_id');
            $table->text('content')->after('title');
        });
    }
};