<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. IPマスターテーブルの作成
        Schema::create('ips', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 例: hololive / 東方Project
            $table->string('guideline_url')->nullable();
            $table->integer('max_sale_limit')->default(200); // 公式が定める生涯通算販売上限数
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. productsテーブルに外部キーをマウント
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'ip_id')) {
                $table->foreignId('ip_id')->nullable()->after('hs_code_id')->constrained('ips')->onDelete('set null');
            }
            // 古い手動入力カラムが残っている場合はクレンジング（移行用にdrop）
            if (Schema::hasColumn('products', 'target_ip')) {
                $table->dropColumn(['target_ip', 'max_sale_limit', 'guideline_url']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['ip_id']);
            $table->dropColumn(['ip_id']);
        });
        Schema::dropIfExists('ips');
    }
};