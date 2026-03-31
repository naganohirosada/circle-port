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
        // 商品の翻訳テーブル
        Schema::table('product_translations', function (Blueprint $table) {
            $table->string('material')->nullable()->after('description')->comment('素材・材質');
        });

        // バリエーションの翻訳テーブル
        Schema::table('variant_translations', function (Blueprint $table) {
            $table->string('material')->nullable()->after('variant_name')->comment('素材・材質');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('translations_tables', function (Blueprint $table) {
            //
        });
    }
};
