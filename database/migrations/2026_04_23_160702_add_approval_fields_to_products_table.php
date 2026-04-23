<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // status の後くらいに追加
            $table->timestamp('published_at')->nullable()->after('status')->comment('公開日時');
            $table->text('rejection_reason')->nullable()->after('published_at')->comment('却下理由');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['published_at', 'rejection_reason']);
        });
    }
};
