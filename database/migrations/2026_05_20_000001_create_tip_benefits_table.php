<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // クリエイターが設定するチップ応援特典の管理
        Schema::create('tip_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained()->onDelete('cascade');
            $table->integer('min_tip_amount')->default(500); // 特典が解放される最低チップ額
            $table->string('benefit_title'); // 例: 限定スマホ壁紙
            $table->string('file_path'); // 特典デジタルアセットの格納パス
            $table->string('file_mime')->nullable();
            $table->timestamps();
        });

        // 海外ファンごとのデジタル特典解放ステータス
        Schema::create('fan_unlocked_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 海外ファンID
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('tip_benefit_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fan_unlocked_benefits');
        Schema::dropIfExists('tip_benefits');
    }
};