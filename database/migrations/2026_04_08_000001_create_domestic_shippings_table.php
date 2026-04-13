<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domestic_shippings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users');
            // 憲法：ステータスは数字で管理 (10:PREPARING, 20:SHIPPED, 30:RECEIVED)
            $table->tinyInteger('status')->default(10);
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable(); // 配送業者
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            // 憲法：論理削除 (Soft Deletes) の採用
            $table->softDeletes(); 

            $table->index('creator_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domestic_shippings');
    }
};