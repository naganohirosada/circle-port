<?php

namespace App\Services\Common;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use App\Models\Order;
use App\Models\Fan;
use App\Models\Payment;
use App\Models\PaymentBreakdown;
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

            // 【5/20仕様変更対応追加】：Stripe側でカードの与信確保（仮売上ホールド）が成功した瞬間のフック
            case 'payment_intent.amount_capturable_updated':
                $this->handlePaymentIntentAmountCapturable($event->data->object);
                break;

            default:
                Log::info('Stripe Webhook: Unhandled event type ' . $event->type);
                break;
        }
    }

    /**
     * 【新設・5/20仕様反映】：GO与信ホールド成功時のステータス更新
     */
    protected function handlePaymentIntentAmountCapturable($intent): void
    {
        try {
            $orderId = $intent->metadata->order_id ?? null;
            if (!$orderId) {
                return;
            }

            DB::transaction(function () use ($orderId, $intent) {
                $order = Order::find($orderId);
                if ($order && (int)$order->payment_status !== PaymentStatus::SUCCEEDED->value) {
                    // 注文および決済ステータスを『仮売上（AUTHORIZED_HOLD：GOM審査待ち）』へ綺麗に昇格
                    $order->update([
                        'payment_status' => PaymentStatus::AUTHORIZED_HOLD->value,
                    ]);

                    DB::table('payments')
                        ->where('order_id', $orderId)
                        ->update([
                            'status' => PaymentStatus::AUTHORIZED_HOLD->value,
                            'external_transaction_id' => $intent->id,
                            'updated_at' => now(),
                        ]);

                    Log::info("GO Order ID #{$orderId} safely shifted to AUTHORIZED_HOLD via Webhook.");
                }
            });

        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handlePaymentIntentAmountCapturable): ' . $e->getMessage());
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

            $currencyCode = strtoupper($session->currency);
            $rawAmount = $session->amount_total;
            $settledAmount = $this->convertFromStripeAmount($rawAmount, $currencyCode);

            DB::transaction(function () use ($orderId, $shippingId, $currencyCode, $settledAmount, $session) {
                if ($orderId) {
                    $order = Order::find($orderId);
                    if ($order) {
                        $order->update([
                            'status' => Order::STATUS_PAID,
                            'settlement_currency' => $currencyCode,
                            'settlement_amount' => $settledAmount,
                        ]);

                        DB::table('payments')
                            ->where('order_id', $orderId)
                            ->update([
                                'status' => PaymentStatus::SUCCEEDED->value,
                                'external_transaction_id' => $session->payment_intent,
                                'updated_at' => now(),
                            ]);
                    }
                }

                if ($shippingId) {
                    $this->intlRepo->markAsPaid($shippingId);
                    $this->createInternationalShippingBreakdownsForSession($shippingId, $session);
                    Log::info("Shipping ID #{$shippingId} marked as PAID via Webhook.");
                }
            });

        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handleCheckoutSessionCompleted): ' . $e->getMessage());
        }
    }

    /**
     * PaymentIntent成功時（保存済みカードでの通常即時決済成功時）
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
                if ($orderId) {
                    Order::where('id', $orderId)->update([
                        'status' => Order::STATUS_PAID,
                        'settlement_currency' => $currencyCode,
                        'settlement_amount' => $settledAmount,
                    ]);
                }

                if ($paymentId || $orderId) {
                    $targetPaymentId = $paymentId ?? ($orderId ? DB::table('payments')->where('order_id', $orderId)->value('id') : null);
                    if ($targetPaymentId) {
                        DB::table('payments')
                            ->where('id', $targetPaymentId)
                            ->update([
                                'status'         => PaymentStatus::SUCCEEDED->value,
                                'external_transaction_id' => $intent->id,
                                'updated_at'     => now(),
                            ]);
                    }
                }

                if ($shippingId) {
                    DB::table('international_shippings')
                        ->where('id', $shippingId)
                        ->update(['status' => 40]);

                    $this->createInternationalShippingBreakdowns($shippingId, $intent);
                }
            });
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handlePaymentIntentSucceeded): ' . $e->getMessage());
        }
    }

    protected function createInternationalShippingBreakdownsForSession($shippingId, $session): void
    {
        $shipping = DB::table('international_shippings')->where('id', $shippingId)->first();
        if (!$shipping) return;

        $payment = DB::table('payments')->where('id', $shipping->payment_id)->first();
        if (!$payment) return;

        $baseShippingFee = $session->metadata->base_shipping_fee ?? $shipping->shipping_fee;
        $internationalFee = $session->metadata->international_fee ?? 0;

        $breakdowns = [];
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

    private function convertFromStripeAmount(int $amount, string $currency): float
    {
        $zeroDecimalCurrencies = ['JPY', 'KRW'];
        if (in_array(strtoupper($currency), $zeroDecimalCurrencies)) {
            return (float) $amount;
        }
        return (float) ($amount / 100);
    }
}