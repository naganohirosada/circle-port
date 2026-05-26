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
        Schema::table('products', function (Blueprint $table) {
            // 二次創作ガイドライン準拠用の拡張カラム
            $table->string('target_ip')->nullable()->after('product_type')->comment('対象IP・キャラクター（例: hololive）');
            $table->integer('max_sale_limit')->nullable()->after('target_ip')->comment('ガイドラインに基づく最大累計販売個数上限（例: 200個）');
            $table->string('guideline_url')->nullable()->after('max_sale_limit')->comment('遵守すべき公式二次創作ガイドラインのURL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['target_ip', 'max_sale_limit', 'guideline_url']);
        });
    }
};