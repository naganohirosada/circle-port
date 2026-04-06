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
        Schema::create('group_order_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_order_id')->constrained();
            $table->foreignId('fan_id')->constrained(); // 参加者
            // 一次決済（商品代金）用の注文ID
            $table->foreignId('primary_order_id')->nullable()->constrained('orders');
            $table->boolean('is_primary_paid')->default(false);
            // 二次決済（送料分割）用の注文ID
            $table->foreignId('secondary_order_id')->nullable()->constrained('orders');
            $table->boolean('is_secondary_paid')->default(false);
            $table->decimal('secondary_amount_share', 12, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_order_participants');
    }
};
