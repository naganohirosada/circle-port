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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('price');
            $table->integer('stock_quantity');
            $table->integer('weight_g');
            $table->string('sku')->unique();
            $table->timestamps();
        });

        // create_variant_translations_table.php
        Schema::create('variant_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id', 'variant_id')->constrained()->onDelete('cascade');
            $table->string('locale')->index();
            $table->string('variant_name'); // 「Lサイズ」など
            $table->text('description')->nullable();
            $table->unique(['product_variant_id', 'locale'], 'variant_locale_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
