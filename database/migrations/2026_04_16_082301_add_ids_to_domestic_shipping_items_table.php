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
        Schema::table('domestic_shipping_items', function (Blueprint $table) {
            // 通常注文用：どの注文明細を発送したか
            $table->foreignId('order_item_id')->nullable()->constrained()->onDelete('set null')->after('domestic_shipping_id');
            // GO注文用：どのGOプロジェクト分を発送したか
            $table->foreignId('group_order_id')->nullable()->constrained()->onDelete('set null')->after('order_item_id');
            
            // 既存の product_id, product_variant_id は、そのままでも良いですが
            // order_item_id から辿れるため、将来的に整理対象にしても良いでしょう。
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domestic_shipping_items', function (Blueprint $table) {
            //
        });
    }
};
