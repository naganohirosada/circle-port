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
        Schema::table('domestic_shippings', function (Blueprint $table) {
            // 通常注文用
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            // GO用
            $table->foreignId('group_order_id')->nullable()->constrained()->onDelete('set null');
            // 配送種別フラグ（'standard' or 'go'）
            $table->string('shipping_type')->default('standard')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
