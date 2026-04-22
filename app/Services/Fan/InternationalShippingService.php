<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use Stripe\Stripe;
use App\Models\Language;
use App\Enums\PaymentStatus;
use App\Models\Fan;
use Stripe\Checkout\Session;

class InternationalShippingService
{
    public function __construct(
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected PaymentMethodRepositoryInterface $paymentRepo
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * 送料決済用のStripeセッションを作成
     */
    public function createCheckoutSession(int $id, int $fanId): string
    {
        // StripeClient インスタンスを生成
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        
        $shipping = $this->intlRepo->findForPayment($id, $fanId);
        $fan = \App\Models\Fan::findOrFail($fanId);

        // 事前作成済みの pending 決済レコードを取得
        $payment = $shipping->payments()
            ->where('status', PaymentStatus::PENDING)
            ->latest()
            ->first();

        if (!$payment) {
            throw new \Exception("Payment record not found for shipping ID: {$id}");
        }

        // 1. デフォルト決済方法と顧客ID
        $defaultMethod = $this->paymentRepo->getDefaultPaymentMethod($fanId);
        $customerId = $fan->stripe_customer_id;

        // 2. 保存済みカードがあれば PaymentIntent で直接決済
        if ($defaultMethod && $customerId) {
            try {
                $stripe->paymentIntents->create([
                    'amount' => $shipping->shipping_fee,
                    'currency' => 'jpy',
                    'customer' => $customerId,
                    'payment_method' => $defaultMethod->provider_id,
                    'off_session' => true,
                    'confirm' => true,
                    'metadata' => [
                        'shipping_id' => $id,
                        'payment_id'  => $payment->id,
                    ],
                ]);
                return route('fan.international-shippings.payment-success', $id);
            } catch (\Stripe\Exception\CardException $e) {
                // 失敗時は Checkout 画面へ流すため続行
            }
        }

        // 3. Checkout セッション作成 (ここを $stripe->checkout->sessions に変更)
        $session = $stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'jpy',
                    'product_data' => ['name' => "International Shipping #{$id}"],
                    'unit_amount' => $shipping->shipping_fee,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('fan.international-shippings.payment-success', $id),
            'cancel_url' => route('fan.international-shippings.index'),
            'payment_intent_data' => [
                'setup_future_usage' => 'off_session',
                'metadata' => [
                    'shipping_id' => $id,
                    'payment_id'  => $payment->id,
                ],
            ],
            'customer' => $customerId ?: null,
            'customer_email' => $customerId ? null : $fan->email,
        ]);

        return $session->url;
    }

    /**
     * ファンの言語設定に合わせた配送一覧を取得
     */
    public function getShippingListForFan(Fan $user)
    {
        // 言語コードの特定（Serviceの責務：コンテキストの解決）
        $languageCode = Language::where('id', $user->language_id)->value('code') ?? 'en';

        // Repositoryの呼び出し
        return $this->intlRepo->getByFanWithTranslations($user->id, $languageCode);
    }
}