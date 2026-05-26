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
        Schema::table('group_orders', function (Blueprint $table) {
            // GOM（主催者）承認制モデルの実装用フラグ
            $table->boolean('is_approval_required')->default(false)->after('status')->comment('主催者（GOM）による参加承認審査を必須とするか');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_orders', function (Blueprint $table) {
            $table->dropColumn(['is_approval_required']);
        });
    }
};