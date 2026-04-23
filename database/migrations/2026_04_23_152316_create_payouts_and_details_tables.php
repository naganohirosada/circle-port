<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 振り込みマスタ（月ごとのサマリーなど）
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2)->comment('振込総額');
            $table->integer('status')->default(10)->comment('10:未振込, 20:処理中, 30:振込済, 90:キャンセル');
            $table->date('scheduled_date')->comment('振込予定日');
            $table->datetime('paid_at')->nullable()->comment('実際の振込完了日時');
            $table->text('admin_notes')->nullable()->comment('管理者メモ');
            $table->timestamps();
        });

        // 振り込み明細（どの決済がこの振り込みに含まれているか）
        Schema::create('payout_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payout_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2)->comment('この決済からの分配額');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_details');
        Schema::dropIfExists('payouts');
    }
};