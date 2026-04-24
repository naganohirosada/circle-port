<?php
namespace App\Services\Admin;

use App\Models\Payment;
use App\Repositories\Interfaces\PaymentRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\PayoutRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Refund;

class PaymentRefundService
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepo,
        protected OrderRepositoryInterface $orderRepo,
        protected PayoutRepositoryInterface $payoutRepo
    ) {}

    /**
     * 全額返金処理を実行する
     */
    public function executeFullRefund(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            // 1. Stripe APIで返金実行
            Stripe::setApiKey(config('services.stripe.secret'));
            Refund::create([
                'payment_intent' => $payment->external_transaction_id,
            ]);

            // 2. 決済ステータス更新 (30: 返金済み)
            $this->paymentRepo->update($payment->id, ['status' => 30]);

            // 3. 注文ステータス更新 (90: キャンセル)
            if ($payment->order_id) {
                $this->orderRepo->update($payment->order_id, ['status' => 90]);
            }

            // 4. 振込予定の調整
            $this->payoutRepo->adjustPayoutForRefund($payment);
        });
    }
}