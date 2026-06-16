<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * マイグレーションの実行: paymentsテーブルにcaptured_at監査カラムを安全に追加
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'captured_at')) {
                $table->timestamp('captured_at')
                    ->nullable()
                    ->after('status')
                    ->comment('資金決済法・収納代行管理用の売上確定（キャプチャ）日時タイムスタンプ');
            }
        });
    }

    /**
     * マイグレーションのロールバック: 追加したcaptured_atカラムを削除して差し戻し
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'captured_at')) {
                $table->dropColumn('captured_at');
            }
        });
    }
};