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
        Schema::table('orders', function (Blueprint $table) {
            // payment_method_id を NULL 許容に変更
            $table->unsignedBigInteger('payment_method_id')->nullable()->change();
            
            // currency_id を NULL 許容に変更
            $table->unsignedBigInteger('currency_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // ロールバック時に NOT NULL に戻す（必要であれば）
            // ※既に NULL が入っている状態で戻すとエラーになるため注意が必要です
            $table->unsignedBigInteger('payment_method_id')->nullable(false)->change();
            $table->unsignedBigInteger('currency_id')->nullable(false)->change();
        });
    }
};