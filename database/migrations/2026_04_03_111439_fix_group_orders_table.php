<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dateTime('recruitment_start_date')->after('status')->comment('募集開始日');
            $table->renameColumn('deadline_at', 'recruitment_end_date'); // UIに合わせてリネーム
            $table->string('shipping_mode', 20)->default('individual')->after('recruitment_end_date'); // individual, bulk
            $table->boolean('is_private')->default(false)->after('shipping_mode');
            $table->boolean('is_secondary_payment_required')->default(true)->after('is_private');

            // 不要なカラムの削除
            $table->dropColumn('max_participants');
        });
    }

    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->renameColumn('end_date', 'recruitment_end_date');
            $table->integer('max_participants')->nullable();
            $table->dropColumn(['recruitment_start_date', 'shipping_mode', 'is_private', 'is_secondary_payment_required']);
        });
    }
};