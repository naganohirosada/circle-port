<?php

namespace App\Services\Common;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
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
            // 新規カード入力（Checkout Session）での決済完了時
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            // 保存済みカード（PaymentIntent直接作成）での決済成功時
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
            // 1. Stripeから詳細情報を取得
            $intent = $this->stripe->paymentIntents->retrieve($session->payment_intent);
            $method = $this->stripe->paymentMethods->retrieve($intent->payment_method);
            
            // 2. メールアドレスからファンを特定
            // （または metadata に fan_id を含めておき、それを使うのがより確実です）
            $fan = Fan::where('email', $session->customer_details->email)->first();

            if (!$fan) {
                Log::error('Stripe Webhook: Fan not found for email ' . $session->customer_details->email);
                return;
            }

            // 3. fansテーブルに stripe_customer_id がなければ保存（初回決済時）
            if (empty($fan->stripe_customer_id)) {
                $fan->update(['stripe_customer_id' => $session->customer]);
            }

            // 4. 決済方法（カード）の登録・更新
            // 既存のデフォルトを解除
            $this->paymentRepo->clearDefaultStatus($fan->id);

            // あなたの addCreditCard 形式に合わせた保存処理
            $this->paymentRepo->updateOrCreatePaymentMethod(
                ['provider_id' => $method->id], // Stripeのpm_xxx IDをキーにする
                [
                    'fan_id'    => $fan->id,
                    'type'      => 1, // Credit Card (PaymentMethod::TYPE_CREDIT_CARD相当)
                    'provider'  => 'stripe',
                    'brand'     => $method->card->brand,
                    'last4'     => $method->card->last4,
                    'exp_month' => $method->card->exp_month,
                    'exp_year'  => $method->card->exp_year,
                    'is_default' => 1,
                ]
            );

            // 5. 国際配送データのステータス更新
            $shippingId = $session->metadata->shipping_id ?? null;
            if ($shippingId) {
                $this->intlRepo->markAsPaid($shippingId);
                Log::info("Shipping ID #{$shippingId} marked as PAID via Webhook.");
            }

        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error (handleCheckoutSessionCompleted): ' . $e->getMessage());
        }
    }

    /**
     * PaymentIntent成功時（保存済みカードでの1クリック決済時）の処理
     */
    protected function handlePaymentIntentSucceeded($intent): void
    {
        $paymentId = $intent->metadata->payment_id ?? null;
        $shippingId = $intent->metadata->shipping_id ?? null;

        if ($paymentId) {
            DB::transaction(function () use ($paymentId, $shippingId, $intent) {
                // 1. payment のステータスを更新し、Stripeの決済IDを記録
                DB::table('payments')
                    ->where('id', $paymentId)
                    ->update([
                        'status'         => PaymentStatus::SUCCEEDED,
                        'external_transaction_id' => $intent->id, // pi_xxx を保存
                        'updated_at'     => now(),
                    ]);

                // 2. 配送ステータスを更新
                if ($shippingId) {
                    DB::table('international_shippings')
                        ->where('id', $shippingId)
                        ->update(['status' => 40]); // Payment Completed
                }
            });
            
            \Log::info("Payment ID #{$paymentId} marked as COMPLETED.");
        }
    }
}