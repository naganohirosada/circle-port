<?php

namespace App\Services\Common;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use App\Models\Order; // 追加
use App\Models\Fan;
use App\Models\Payment; // 追加
use App\Models\PaymentBreakdown; // 追加
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
                    // 国際配送の支払い内訳を作成
                    $this->createInternationalShippingBreakdownsForSession($shippingId, $session);
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
                    $targetPaymentId = $paymentId ?? ($orderId ? DB::table('payments')->where('order_id', $orderId)->value('id') : null);
                    if ($targetPaymentId) {
                        DB::table('payments')
                            ->where('id', $targetPaymentId)
                            ->update([
                                'status'         => PaymentStatus::SUCCEEDED,
                                'external_transaction_id' => $intent->id,
                                'updated_at'     => now(),
                            ]);
                    }
                }

                // 国際配送ステータスの更新と内訳作成
                if ($shippingId) {
                    DB::table('international_shippings')
                        ->where('id', $shippingId)
                        ->update(['status' => 40]); // Payment Completed

                    // 国際配送の支払い内訳を作成
                    $this->createInternationalShippingBreakdowns($shippingId, $intent);
                }
            });
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handlePaymentIntentSucceeded): ' . $e->getMessage());
        }
    }

    /**
     * Checkout Session用の国際配送内訳作成
     */
    protected function createInternationalShippingBreakdownsForSession($shippingId, $session): void
    {
        $shipping = DB::table('international_shippings')->where('id', $shippingId)->first();
        if (!$shipping) {
            return;
        }

        $payment = DB::table('payments')->where('id', $shipping->payment_id)->first();
        if (!$payment) {
            return;
        }

        $baseShippingFee = $session->metadata->base_shipping_fee ?? $shipping->shipping_fee;
        $internationalFee = $session->metadata->international_fee ?? 0;

        // 内訳を作成
        $breakdowns = [];

        // 国際送料（バンドリング手数料）
        if ($baseShippingFee > 0) {
            $breakdowns[] = [
                'payment_id' => $payment->id,
                'type' => PaymentBreakdown::TYPE_INTL_SHIPPING,
                'amount' => $baseShippingFee,
                'currency_id' => $payment->currency_id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // 国際配送手数料（3%）
        if ($internationalFee > 0) {
            $breakdowns[] = [
                'payment_id' => $payment->id,
                'type' => PaymentBreakdown::TYPE_HANDLING_FEE,
                'amount' => $internationalFee,
                'currency_id' => $payment->currency_id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($breakdowns)) {
            DB::table('payment_breakdown')->insert($breakdowns);
        }
    }
            return (float) $amount;
        }

        // USDなどは100セント=1ドルのため、100で割る
        return (float) ($amount / 100);
    }
}