<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. 既存データの変換 ('standard'や'regular'を10に、'go'を20に変換)
        DB::table('domestic_shippings')->whereIn('shipping_type', ['standard', 'regular'])->update(['shipping_type' => '10']);
        DB::table('domestic_shippings')->where('shipping_type', 'go')->update(['shipping_type' => '20']);

        // 2. カラムの型を変更
        Schema::table('domestic_shippings', function (Blueprint $table) {
            $table->unsignedTinyInteger('shipping_type')->default(10)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domestic_shippings', function (Blueprint $table) {
            $table->string('shipping_type', 255)->default('standard')->change();
        });

        // データの逆変換
        DB::table('domestic_shippings')->where('shipping_type', '10')->update(['shipping_type' => 'standard']);
        DB::table('domestic_shippings')->where('shipping_type', '20')->update(['shipping_type' => 'go']);
    }
};