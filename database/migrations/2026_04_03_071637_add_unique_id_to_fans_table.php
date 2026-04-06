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
        Schema::table('fans', function (Blueprint $table) {
            // 検索を高速化するために uniqueインデックスを貼ります
            $table->string('unique_id')->unique()->after('name')->comment('検索用ユーザーID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fans', function (Blueprint $table) {
            //
        });
    }
};
