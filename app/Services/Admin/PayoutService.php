<?php

namespace App\Services\Admin;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\PayoutDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayoutService
{
        public function recordPaymentToPayout(Payment $payment)
    {
        // 1. 決済ステータスの確認 (Enum キャスト対応)
        if (!$payment->order_id || $payment->status !== \App\Enums\PaymentStatus::SUCCEEDED) {
            return;
        }

        // 2. 注文情報からクリエイターIDを取得
        $payment->order->loadMissing('orderItems.product');
        
        $firstItem = $payment->order->orderItems->first();
        if (!$firstItem || !$firstItem->product) {
            Log::error("Payout Error: Order items or product not found for Order ID: {$payment->order_id}");
            return;
        }

        $creatorId = $firstItem->product->creator_id;

        if (!$creatorId) {
            Log::error("Payout Error: Creator ID is null for Product ID: {$firstItem->product_id}");
            return;
        }

        // 3. 振込額の計算 (既存ロジック)
        $breakdowns = $payment->breakdowns;
        
        // 収益 = 商品代(1) + 国内送料(2) + 商品税(5) + 送料税(7)
        $income = $breakdowns->whereIn('type', [1, 2, 5, 7])->sum('amount');
        // 手数料(4) を差し引く
        $fee = $breakdowns->where('type', 4)->sum('amount');
        $creatorAmount = $income - $fee;

        if ($creatorAmount <= 0) return;

        // 4. 振込予定日の設定 (翌月末)
        $scheduledDate = Carbon::now()->addMonth()->endOfMonth()->toDateString();

        // 5. 振込レコードの作成・更新
        // トランザクションを利用して整合性を確保
        DB::transaction(function () use ($creatorId, $scheduledDate, $creatorAmount, $payment) {
            $payout = Payout::firstOrCreate(
                [
                    'creator_id' => $creatorId,
                    'status' => Payout::STATUS_PENDING,
                    'scheduled_date' => $scheduledDate,
                ],
                [
                    'amount' => 0,
                ]
            );

            // 振込総額を加算
            $payout->increment('amount', $creatorAmount);

            // 決済明細を作成
            PayoutDetail::create([
                'payout_id' => $payout->id,
                'payment_id' => $payment->id,
                'amount' => $creatorAmount,
            ]);
        });
    }
}