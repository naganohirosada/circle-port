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
        Schema::table('fans', function (Blueprint $table) {
            // 言語と通貨の優先設定
            $table->string('language_code', 5)->default('en')->after('email'); 
            $table->string('currency_code', 3)->default('USD')->after('language_code');

            // タイムゾーン（発送連絡などの時間表示用）
            $table->string('timezone')->default('UTC')->after('currency_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
