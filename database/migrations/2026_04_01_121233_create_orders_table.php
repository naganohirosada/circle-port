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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained('fans');
            $table->foreignId('address_id')->constrained('addresses');
            $table->foreignId('payment_method_id')->constrained('payment_methods');
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('currency_id')->constrained('currencies');
            // 10:待機, 20:支払済, 30:倉庫へ発送中, 40:倉庫到着, 50:完了, 90:キャンセル
            $table->integer('status')->default(10)->index();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
