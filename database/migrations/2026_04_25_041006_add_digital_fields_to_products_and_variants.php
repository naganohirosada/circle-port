<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // productsテーブルの拡張
        Schema::table('products', function (Blueprint $blueprint) {
            // 1: 現物作品, 2: デジタル作品 (デフォルトは1)
            $blueprint->tinyInteger('product_type')->default(1)->after('creator_id');
            // デジタル作品（単一）時のファイルパス
            $blueprint->string('digital_file_path')->nullable()->after('hs_code_id');
        });

        // product_variantsテーブルの拡張
        Schema::table('product_variants', function (Blueprint $blueprint) {
            // バリエーションごとのデジタルファイルパス
            $blueprint->string('digital_file_path')->nullable()->after('hs_code_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['product_type', 'digital_file_path']);
        });

        Schema::table('product_variants', function (Blueprint $blueprint) {
            $blueprint->dropColumn('digital_file_path');
        });
    }
};