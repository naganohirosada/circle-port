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
        Schema::create('international_shipping_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('international_shipping_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained(); // どの注文明細か
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('international_shipping_items');
    }
};
