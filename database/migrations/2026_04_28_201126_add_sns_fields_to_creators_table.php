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
            // SNS ID系 (IDのみを保存)
            $table->string('x_id')->nullable()->after('profile')->comment('X (Twitter) ID');
            $table->string('pixiv_id')->nullable()->after('x_id')->comment('pixiv ID');
            $table->string('bluesky_id')->nullable()->after('pixiv_id')->comment('Bluesky ID');
            $table->string('instagram_id')->nullable()->after('bluesky_id')->comment('Instagram ID');

            // URL系 (フルURLを保存)
            $table->string('booth_url')->nullable()->after('instagram_id')->comment('BOOTH ショップURL');
            $table->string('fanbox_url')->nullable()->after('booth_url')->comment('支援サイト(FANBOX/Fantia) URL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->dropColumn([
                'x_id',
                'pixiv_id',
                'bluesky_id',
                'instagram_id',
                'booth_url',
                'fanbox_url'
            ]);
        });
    }
};