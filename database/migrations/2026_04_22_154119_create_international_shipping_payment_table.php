<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('international_shipping_payment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('international_shipping_id')->constrained()->onDelete('cascade');
            // その決済時点での金額を記録しておくと、後に送料が変更されても追跡できるため推奨
            $table->integer('amount')->comment('決済時の配送料');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('international_shipping_payment');
    }
};
