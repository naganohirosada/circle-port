<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domestic_shipping_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domestic_shipping_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained();
            $table->foreignId('product_variant_id')->constrained();
            $table->integer('quantity');
            $table->timestamps();
            // 憲法：論理削除
            $table->softDeletes(); 

            $table->index('domestic_shipping_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domestic_shipping_items');
    }
};