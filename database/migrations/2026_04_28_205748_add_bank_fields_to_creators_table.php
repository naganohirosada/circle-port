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
        Schema::table('creators', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('fanbox_url')->comment('銀行名');
            $table->string('branch_name')->nullable()->after('bank_name')->comment('支店名');
            $table->string('account_type')->nullable()->after('branch_name')->comment('口座種別'); // 普通・当座
            $table->string('account_number')->nullable()->after('account_type')->comment('口座番号');
            $table->string('account_holder')->nullable()->after('account_number')->comment('口座名義');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'branch_name', 'account_type', 'account_number', 'account_holder']);
        });
    }
};
