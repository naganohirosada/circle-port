<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('default_hs_code_id')->nullable()->constrained('hs_codes')->nullOnDelete();
        });
        Schema::table('sub_categories', function (Blueprint $table) {
            $table->foreignId('default_hs_code_id')->nullable()->constrained('hs_codes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['default_hs_code_id']);
            $table->dropColumn('default_hs_code_id');
        });
        Schema::table('sub_categories', function (Blueprint $table) {
            $table->dropForeign(['default_hs_code_id']);
            $table->dropColumn('default_hs_code_id');
        });
    }
};