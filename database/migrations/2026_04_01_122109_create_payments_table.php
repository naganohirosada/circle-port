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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('external_transaction_id')->nullable()->index();
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('currency_id')->constrained('currencies');
            // 10:Pending, 20:Succeeded, 30:Failed, 40:Refunded
            $table->integer('status')->default(10)->index();
            // 1:CreditCard, 2:PayPal, 3:Alipay ...
            $table->integer('method_type')->index();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
