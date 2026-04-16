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
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // 倉庫名（例：東京第一配送センター）
            $table->string('postal_code');   // 郵便番号
            $table->string('address');       // 住所
            $table->string('recipient_name');// 受領担当名（例：サークルポート受領係）
            $table->string('phone');         // 電話番号
            $table->boolean('is_active')->default(true); // 稼働フラグ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
