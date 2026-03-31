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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('hs_code_id')->nullable()->after('category_id')->constrained('hs_codes')->onDelete('set null');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->foreignId('hs_code_id')->nullable()->after('sku')->constrained('hs_codes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products_and_variants', function (Blueprint $table) {
            //
        });
    }
};
