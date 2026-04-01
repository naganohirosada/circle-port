<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            // 憲法：重複データを排除（正規化）するために古いカラムを削除
            $table->dropColumn(['name_ja', 'name_en']);
        });
    }

    public function down(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->string('name_ja')->after('id');
            $table->string('name_en')->after('name_ja');
        });
    }
};
