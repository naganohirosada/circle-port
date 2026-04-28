<?php

namespace App\Services\Common;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use App\Models\Order;
use App\Models\PaymentMethod;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * パターン1: 保存済みカードで即時決済（Off-Session）
     */
    public function chargeSavedCard(Order $order, PaymentMethod $paymentMethod)
    {
        return PaymentIntent::create([
            'amount' => (int) $order->total_amount,
            'currency' => 'jpy',
            'customer' => $order->fan->stripe_customer_id,
            'payment_method' => $paymentMethod->stripe_payment_method_id,
            'off_session' => true,
            'confirm' => true,
            'metadata' => [
                'order_id' => $order->id,
                'type' => 'group_order_immediate'
            ],
        ]);
    }

    /**
     * パターン2: 新規決済 兼 カード保存用セッション作成
     */
    public function createEscrowAndSaveCardSession(Order $order): Session
    {
        $lineItems = [];
        foreach ($order->items as $item) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'jpy',
                    'product_data' => ['name' => $item->product->translations->first()->name ?? 'Item'],
                    'unit_amount' => (int) $item->price,
                ],
                'quantity' => $item->quantity,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],
            'customer' => $order->fan->stripe_customer_id, // 既存顧客IDを指定
            'line_items' => $lineItems,
            'mode' => 'payment',
            // 【重要】決済後にこのカードを将来的に再利用可能にする設定
            'payment_intent_data' => [
                'setup_future_usage' => 'off_session',
            ],
            'success_url' => route('fan.go.thanks', ['id' => $order->group_order_id, 'order_id' => $order->id]),
            'cancel_url' => route('fan.go.detail', $order->group_order_id),
            'metadata' => [
                'order_id' => $order->id,
                'fan_id' => $order->fan_id,
                'type' => 'group_order_new_card'
            ],
        ]);
    }

	/**
     * バッチ用：保存済みカードに対して決済を実行する
     */
    public function captureSavedCardPayment(Order $order, PaymentMethod $paymentMethod)
    {
        try {
            return PaymentIntent::create([
                'amount' => (int) $order->total_amount,
                'currency' => 'jpy',
                'customer' => $order->fan->stripe_customer_id,
                'payment_method' => $paymentMethod->stripe_payment_method_id,
                'off_session' => true, // ユーザーが操作していない状態で実行
                'confirm' => true,     // 即時確定
                'metadata' => [
                    'order_id' => $order->id,
                    'type' => 'go_batch_settlement'
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("GO Settlement Failed - Order ID: {$order->id} - Error: " . $e->getMessage());
            throw $e;
        }
    }
}