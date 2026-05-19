<?php

namespace App\Services\Admin;

use App\Models\Payment;
use App\Models\Payout;
use App\Models\PayoutDetail;
use Carbon\Carbon;
use App\Models\PaymentBreakdown;
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
        $payment->order->loadMissing('orderItems.product', 'address');
        
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

        // 3. 【核心仕様】国内(JP)・海外および配送アプローチ（倉庫一括・自己発送）の精密判定
        $address = $payment->order->address;
        $isDomestic = $address ? ($address->country_code === 'JP') : true;

        // 10: 倉庫一括配送 (WAREHOUSE), 20: 自己発送 (DIRECT)
        $isDirectShipping = ($firstItem->product->domestic_shipping_method === 20);

        $breakdowns = $payment->breakdowns;
        if ($isDomestic && $isDirectShipping) {
            // -------------------------------------------------------------
            // 【パターンC：国内自己発送】
            // クリエイター自身が送料を負担して直接配送するため、送料マージンを全額分配する
            // 収益 = 商品代(1) + 国内送料(2) + 商品税(5) + 送料税(7)
            // -------------------------------------------------------------
            $income = $breakdowns->whereIn('type', [
                PaymentBreakdown::TYPE_ITEM_TOTAL,
                PaymentBreakdown::TYPE_DOMESTIC_SHIPPING,
                PaymentBreakdown::TYPE_ITEM_TAX,
                PaymentBreakdown::TYPE_SHIPPING_TAX
            ])->sum('amount');
        } else {
            // -------------------------------------------------------------
            // 【パターンA：国際】または【パターンB：国内一括配送】
            // 配送料はサークルポート（倉庫運賃、運営費）が回収するため、クリエイターの利益からは除外
            // 収益 = 商品代(1) + 商品税(5)
            // -------------------------------------------------------------
            $income = $breakdowns->whereIn('type', [
                PaymentBreakdown::TYPE_ITEM_TOTAL,
                PaymentBreakdown::TYPE_ITEM_TAX
            ])->sum('amount');
        }

        // 手数料(4) を差し引く
        $fee = $breakdowns->where('type', PaymentBreakdown::TYPE_HANDLING_FEE)->sum('amount');
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