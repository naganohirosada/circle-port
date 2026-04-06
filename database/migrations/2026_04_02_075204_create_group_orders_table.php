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
        Schema::create('group_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_id')->constrained('fans'); // GOM
            $table->foreignId('creator_id')->constrained('creators'); // 対象クリエイター
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('status')->default(10); // 10:募集中, 20:一次決済中...
            $table->dateTime('deadline_at'); // 募集期限
            $table->integer('max_participants')->nullable(); // 最大人数
            // 物流関連
            $table->foreignId('address_id')->nullable()->constrained('addresses'); // GOMの配送先(最終届先)
            $table->decimal('total_secondary_amount', 12, 2)->default(0); // 倉庫から請求された国際送料等の総額
            $table->timestamps();
            $table->softDeletes(); // 憲法：論理削除
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_orders');
    }
};
