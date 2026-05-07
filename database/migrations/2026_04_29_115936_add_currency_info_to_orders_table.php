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
        Schema::table('orders', function (Blueprint $table) {
            // 決済時の通貨コードとレート、実際に決済された外貨額を保存
            $table->string('settlement_currency', 3)->default('JPY')->after('total_amount');
            $table->decimal('settlement_rate', 15, 8)->default(1.0)->after('settlement_currency');
            $table->decimal('settlement_amount', 15, 2)->nullable()->after('settlement_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['settlement_currency', 'settlement_rate', 'settlement_amount']);
        });
    }
};
