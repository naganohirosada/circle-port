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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            // クリエイター（ユーザー）との紐付け
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            // 金額管理（目標額・現在額）
            $table->decimal('target_amount', 12, 2)->default(0);
            $table->decimal('current_amount', 12, 2)->default(0);
            
            // 憲法：ステータスは数字で管理
            // 10: 下書き, 20: 公開中, 30: 成功（目標達成）, 40: 終了, 50: 中止
            $table->integer('status')->default(10);
            
            // スケジュール管理
            $table->date('delivery_date')->nullable(); // お届け予定日（延長機能の対象）
            $table->dateTime('end_date')->nullable();    // 募集終了日
            
            $table->timestamps();
            $table->softDeletes(); // 論理削除対応
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};