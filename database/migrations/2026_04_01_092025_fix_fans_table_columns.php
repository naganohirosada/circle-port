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
            // 1. 言語カラムの修正 (code文字列からidへ)
            if (Schema::hasColumn('fans', 'language_code')) {
                $table->dropColumn('language_code');
            }
            $table->foreignId('language_id')->nullable()->after('country_id')->constrained('languages');

            // 2. 通貨カラムの修正 (code文字列からidへ)
            if (Schema::hasColumn('fans', 'currency_code')) {
                $table->dropColumn('currency_code');
            }
            $table->foreignId('currency_id')->nullable()->after('language_id')->constrained('currencies');
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
