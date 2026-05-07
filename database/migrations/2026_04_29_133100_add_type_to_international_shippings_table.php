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
        Schema::table('international_shippings', function (Blueprint $table) {
            // 1: Regular (通常), 2: Consolidated (同梱)
            $table->tinyInteger('type')->default(1)->after('fan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('international_shippings', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
