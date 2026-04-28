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
        Schema::table('group_orders', function (Blueprint $table) {
            // 招待用のユニークなハッシュコードを追加
            $table->string('invite_code', 32)->nullable()->unique()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            //
        });
    }
};
