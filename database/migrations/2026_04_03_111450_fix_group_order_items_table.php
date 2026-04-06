<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('group_order_items', function (Blueprint $table) {
            $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
            $table->string('item_name')->after('product_variant_id'); // 募集時点の商品名
            $table->integer('price')->default(0)->after('item_name'); // 募集時点の単価
            $table->integer('stock_limit')->default(0)->after('price'); // 在庫上限
        });
    }

    public function down(): void
    {
        Schema::table('group_order_items', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn(['product_variant_id', 'item_name', 'price', 'stock_limit']);
        });
    }
};
