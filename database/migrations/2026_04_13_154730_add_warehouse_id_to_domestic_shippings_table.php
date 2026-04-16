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
        Schema::table('domestic_shippings', function (Blueprint $table) {
            $table->foreignId('warehouse_id')
                ->after('creator_id')
                ->nullable() // 既存レコードへの配慮
                ->constrained('warehouses')
                ->onDelete('restrict'); // 倉庫が消されても配送データは守る
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domestic_shippings', function (Blueprint $table) {
            // 外部キー制約を削除してからカラムを削除
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn('warehouse_id');
        });
    }
};