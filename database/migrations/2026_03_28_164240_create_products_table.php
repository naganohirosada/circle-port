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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained();
            $table->boolean('has_variants')->default(false);
            // 単品時のデータ
            $table->integer('price')->nullable();
            $table->integer('stock_quantity')->nullable();
            $table->integer('weight_g')->nullable();
            $table->string('sku')->nullable()->unique();
            $table->integer('status')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        // create_product_translations_table.php
        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('locale')->index(); // 'ja', 'en' など
            $table->string('name');
            $table->text('description');
            $table->unique(['product_id', 'locale']); // 1商品1言語1レコード
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
