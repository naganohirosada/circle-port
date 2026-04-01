<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fans', function (Blueprint $table) {
            // 文字列カラムを削除
            if (Schema::hasColumn('fans', 'timezone')) {
                $table->dropColumn('timezone');
            }
            
            // 外部キーを追加
            $table->foreignId('timezone_id')
                  ->nullable()
                  ->after('language_code')
                  ->constrained('timezones')
                  ->onDelete('set null'); // マスタが消えてもファンは消さない（安全策）
        });
    }

    public function down(): void
    {
        Schema::table('fans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('timezone_id');
            $table->string('timezone')->nullable();
        });
    }
};