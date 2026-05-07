<?php

namespace App\Services\Common;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use App\Models\Order; // 追加
use App\Models\Fan;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Illuminate\Support\Facades\DB;
use App\Enums\PaymentStatus;

class StripeWebhookService
{
    protected StripeClient $stripe;

    public function __construct(
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected PaymentMethodRepositoryInterface $paymentRepo
    ) {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * イベントタイプに応じて処理を分岐
     */
    public function handleEvent($event): void
    {
        Log::info('--- Webhook Event Received: ' . $event->type . ' ---');
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            default:
                Log::info('Stripe Webhook: Unhandled event type ' . $event->type);
                break;
        }
    }

    /**
     * Checkout Session 完了時の処理（新規カードの保存 ＋ ステータス更新）
     */
    protected function handleCheckoutSessionCompleted($session): void
    {
        try {
            $orderId = $session->metadata->order_id ?? null;
            $shippingId = $session->metadata->shipping_id ?? null;

            // 多通貨情報：Stripeで実際に決済された情報を取得
            $currencyCode = strtoupper($session->currency); // 'usd', 'jpy' -> 'USD', 'JPY'
            $rawAmount = $session->amount_total; // Stripe最小単位（セントや円）

            // セント単位を整数（ドル単位）に変換
            $settledAmount = $this->convertFromStripeAmount($rawAmount, $currencyCode);

            DB::transaction(function () use ($orderId, $shippingId, $currencyCode, $settledAmount, $session) {
                // 1. 通常注文(Order)の決済確定
                if ($orderId) {
                    $order = Order::find($orderId);
                    if ($order) {
                        $order->update([
                            'status' => Order::STATUS_PAID,
                            'settlement_currency' => $currencyCode,
                            'settlement_amount' => $settledAmount,
                            // レートは注文作成時のものを維持（または必要に応じてSessionから逆算）
                        ]);

                        // 関連するPaymentレコードも更新
                        DB::table('payments')
                            ->where('order_id', $orderId)
                            ->update([
                                'status' => PaymentStatus::SUCCEEDED,
                                'external_transaction_id' => $session->payment_intent,
                                'updated_at' => now(),
                            ]);
                    }
                }

                // 2. 国際配送料(International Shipping)の決済確定
                if ($shippingId) {
                    $this->intlRepo->markAsPaid($shippingId);
                    Log::info("Shipping ID #{$shippingId} marked as PAID via Webhook.");
                }
            });

        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handleCheckoutSessionCompleted): ' . $e->getMessage());
        }
    }

    /**
     * PaymentIntent成功時（保存済みカードでの決済時）
     */
    protected function handlePaymentIntentSucceeded($intent): void
    {
        try {
            $orderId = $intent->metadata->order_id ?? null;
            $paymentId = $intent->metadata->payment_id ?? null;
            $shippingId = $intent->metadata->shipping_id ?? null;

            $currencyCode = strtoupper($intent->currency);
            $settledAmount = $this->convertFromStripeAmount($intent->amount, $currencyCode);

            DB::transaction(function () use ($orderId, $paymentId, $shippingId, $intent, $currencyCode, $settledAmount) {
                // Orderの更新
                if ($orderId) {
                    Order::where('id', $orderId)->update([
                        'status' => Order::STATUS_PAID,
                        'settlement_currency' => $currencyCode,
                        'settlement_amount' => $settledAmount,
                    ]);
                }

                // Paymentレコードの更新
                if ($paymentId || $orderId) {
                    DB::table('payments')
                        ->where($paymentId ? 'id' : 'order_id', $paymentId ?? $orderId)
                        ->update([
                            'status'         => PaymentStatus::SUCCEEDED,
                            'external_transaction_id' => $intent->id,
                            'updated_at'     => now(),
                        ]);
                }

                // 国際配送ステータスの更新
                if ($shippingId) {
                    DB::table('international_shippings')
                        ->where('id', $shippingId)
                        ->update(['status' => 40]); // Payment Completed
                }
            });
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handlePaymentIntentSucceeded): ' . $e->getMessage());
        }
    }

    /**
     * Stripeの最小単位から通常の数値へ変換
     */
    private function convertFromStripeAmount($amount, $currencyCode): float
    {
        $zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];

        if (in_array(strtoupper($currencyCode), $zeroDecimalCurrencies)) {
            return (float) $amount;
        }

        // USDなどは100セント=1ドルのため、100で割る
        return (float) ($amount / 100);
    }
}