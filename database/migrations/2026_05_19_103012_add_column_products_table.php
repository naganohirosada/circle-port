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
            // 10: WAREHOUSE (倉庫一括), 20: DIRECT (自己発送)
            $table->tinyInteger('domestic_shipping_method')->default(10)->after('product_type');
            // 自己発送時の個別送料（円ベース）
            $table->integer('domestic_direct_shipping_fee')->default(0)->after('domestic_shipping_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['domestic_shipping_method', 'domestic_direct_shipping_fee']);
        });
    }
};
