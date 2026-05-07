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
        // 決済通貨とStripe用金額を取得
        [$currencyCode, $stripeAmount] = $this->getSettlementDetails($order);

        return PaymentIntent::create([
            'amount' => $stripeAmount,
            'currency' => $currencyCode,
            'customer' => $order->fan->stripe_customer_id,
            'payment_method' => $paymentMethod->stripe_payment_method_id,
            'off_session' => true,
            'confirm' => true,
            'metadata' => [
                'order_id' => $order->id,
                'type' => 'group_order_immediate',
                'base_jpy_amount' => $order->total_amount
            ],
        ]);
    }

    /**
     * パターン2: 新規決済 兼 カード保存用セッション作成
     */
    public function createEscrowAndSaveCardSession(Order $order): Session
    {
        $fanCurrency = $order->fan->currency;
        $currencyCode = strtolower($fanCurrency->code ?? 'jpy');
        $rate = (float) ($fanCurrency->exchange_rate ?? 1.0);

        $lineItems = [];
        foreach ($order->items as $item) {
            // 各アイテムの単価を外貨換算（切り捨て）し、Stripe単位へ
            $convertedPrice = floor($item->price * $rate);
            $stripeUnitAmount = $this->convertToStripeAmount($convertedPrice, $currencyCode);

            $lineItems[] = [
                'price_data' => [
                    'currency' => $currencyCode,
                    'product_data' => [
                        'name' => $item->product->translations->first()->name ?? 'Item',
                        'description' => "Base Price: ¥" . number_format($item->price) . " JPY",
                    ],
                    'unit_amount' => $stripeUnitAmount,
                ],
                'quantity' => $item->quantity,
            ];
        }

        // 手数料や配送料などの調整が必要な場合は、別途 line_items に追加するか、
        // 注文全体の合計（$order->total_amount）に基づく調整用アイテムを追加します。

        $itemAmountSum = 0;
        foreach ($order->items as $item) {
            $itemAmountSum += $item->price * $item->quantity;
        }

        $tipAmount = 0;
        if (!empty($order->notes)) {
            $decoded = json_decode($order->notes, true);
            if (is_array($decoded) && isset($decoded['creator_tip'])) {
                $tipAmount = max(0, (int) $decoded['creator_tip']);
            }
        }

        $convertedOrderTotal = floor($order->total_amount * $rate);
        $convertedFeeAmount = max(0, $convertedOrderTotal - floor($itemAmountSum * $rate));

        if ($convertedFeeAmount > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => $currencyCode,
                    'product_data' => [
                        'name' => $tipAmount > 0 ? 'GO Order Fee + Creator Tip' : 'GO Order Fee (5%)',
                        'description' => $tipAmount > 0 ? "GO platform fee plus creator tip for order #{$order->id}" : "GO platform fee for order #{$order->id}",
                    ],
                    'unit_amount' => $this->convertToStripeAmount($convertedFeeAmount, $currencyCode),
                ],
                'quantity' => 1,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],
            'customer' => $order->fan->stripe_customer_id,
            'line_items' => $lineItems,
            'mode' => 'payment',
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
            [$currencyCode, $stripeAmount] = $this->getSettlementDetails($order);

            return PaymentIntent::create([
                'amount' => $stripeAmount,
                'currency' => $currencyCode,
                'customer' => $order->fan->stripe_customer_id,
                'payment_method' => $paymentMethod->stripe_payment_method_id,
                'off_session' => true,
                'confirm' => true,
                'metadata' => [
                    'order_id' => $order->id,
                    'type' => 'go_batch_settlement',
                    'base_jpy_amount' => $order->total_amount
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("GO Settlement Failed - Order ID: {$order->id} - Error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 注文データから決済通貨とStripe用金額を算出するヘルパー
     */
    private function getSettlementDetails(Order $order): array
    {
        $currency = $order->fan->currency;
        $currencyCode = strtolower($currency->code ?? 'jpy');
        $rate = (float) ($currency->exchange_rate ?? 1.0);

        // 日本円 × レート を計算し、小数点以下を切り捨て
        $convertedAmount = floor($order->total_amount * $rate);

        // Stripeの最小単位（セント等）に変換
        $stripeAmount = $this->convertToStripeAmount($convertedAmount, $currencyCode);

        return [$currencyCode, $stripeAmount];
    }

    /**
     * 通貨に応じたStripe用金額（最小単位）への変換
     */
    private function convertToStripeAmount($amount, $currencyCode): int
    {
        // 小数点を持たない通貨（ゼロデシマル通貨）
        $zeroDecimalCurrencies = [
            'jpy', 'krw', 'vnd', 'clp', 'isk', 'ugx'
        ];

        if (in_array(strtolower($currencyCode), $zeroDecimalCurrencies)) {
            return (int) $amount;
        }

        // 米ドル(USD)などは 1ドル=100セント なので100倍する
        return (int) ($amount * 100);
    }
}