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
        Schema::table('group_orders', function (Blueprint $table) {
            // 確定した国内配送料（GOMが入力する）
            $table->decimal('final_domestic_shipping_fee', 10, 2)->nullable()->after('status');
            // 1:待機, 2:処理中, 3:完了, 4:失敗
            $table->tinyInteger('primary_payment_status')->default(1);
        });

        Schema::table('group_order_participants', function (Blueprint $table) {
            // 1:未払, 2:支払済, 3:失敗
            $table->tinyInteger('payment_status')->default(1);
            $table->string('payment_error_message')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            //
        });
    }
};
