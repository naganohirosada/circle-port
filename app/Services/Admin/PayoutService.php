<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\PayoutDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayoutService
{
    public function recordPaymentToPayout(Payment $payment)
    {
        // 1次決済以外、または未完了の決済は対象外
        if (!$payment->order_id || (int)$payment->status !== 20) {
            return;
        }

        // 注文情報からクリエイターIDを取得
        $creatorId = $payment->order->product_creator_id; 

        // 【振込額の計算】
        // 内訳(PaymentBreakdown)から算出
        // クリエイター受取額 = (商品代 + 国内送料 + 商品税 + 送料税) - (システム手数料)
        $breakdowns = $payment->breakdowns;
        
        $income = $breakdowns->whereIn('type', [1, 2, 5, 7])->sum('amount'); // 収益
        $fee = $breakdowns->where('type', 4)->sum('amount');              // 手数料
        $creatorAmount = $income - $fee;

        if ($creatorAmount <= 0) return;

        // 振込予定日（例：翌月末）
        $scheduledDate = Carbon::now()->addMonth()->endOfMonth()->toDateString();

        // 既存の未振込レコードを探すか、新規作成する
        $payout = Payout::firstOrCreate(
            [
                'creator_id' => $creatorId,
                'status' => Payout::STATUS_PENDING, // 10
                'scheduled_date' => $scheduledDate,
            ],
            [
                'amount' => 0,
            ]
        );

        // 振込総額を加算
        $payout->increment('amount', $creatorAmount);

        // どの決済が含まれているかの明細を作成
        PayoutDetail::create([
            'payout_id' => $payout->id,
            'payment_id' => $payment->id,
            'amount' => $creatorAmount,
        ]);
    }
}