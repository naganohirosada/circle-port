<?php

namespace App\Services\Common;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Currency;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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

        // 【仕様変更・大掃除Fix】：架空カラムを撤廃し、本物の「provider_id」プロパティをダイレクトに参照！
        $pmId = $paymentMethod->provider_id;

        // 万が一のEloquent遅延ロード怪現象に備え、DBからprovider_idを直接一本釣りする最強の防衛線
        if (empty($pmId) && isset($paymentMethod->id)) {
            $pmId = DB::table('payment_methods')
                ->where('id', $paymentMethod->id)
                ->value('provider_id');
        }

        if (empty($pmId)) {
            Log::error("Stripe Checkout Error: Local PaymentMethod record [ID: {$paymentMethod->id}] is physically missing its token in provider_id column.");
            throw new \Exception(__('Selected payment method is physically missing its Stripe token configuration. Please re-register your card.'));
        }

        return PaymentIntent::create([
            'amount' => $stripeAmount,
            'currency' => $currencyCode,
            'customer' => $order->fan->stripe_customer_id,
            'payment_method' => $pmId, // 確実に一本釣りされた本物のpm_1PDhYI...トークン
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
     * パターン2: 新規決済 兼 カード保存用セッション作成（GOM承認制・仮売上オーソリ仕様）
     */
    public function createEscrowAndSaveCardSession(Order $order, array $options = []): Session
    {
        $fanCurrency = $order->fan->currency;
        $currencyCode = strtolower($fanCurrency->code ?? 'jpy');
        $rate = (float) ($fanCurrency->exchange_rate ?? 1.0);

        $lineItems = [];
        foreach ($order->items as $item) {
            $convertedPrice = $rate > 0 ? floor($item->price / $rate) : $item->price;
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

        $convertedOrderTotal = $rate > 0 ? floor($order->total_amount / $rate) : $order->total_amount;
        $convertedItemSum = $rate > 0 ? floor($itemAmountSum / $rate) : $itemAmountSum;
        $convertedFeeAmount = max(0, $convertedOrderTotal - $convertedItemSum);

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

        $captureMethod = $options['capture_method'] ?? 'automatic';

        return Session::create([
            'payment_method_types' => ['card'],
            'customer' => $order->fan->stripe_customer_id,
            'line_items' => $lineItems,
            'mode' => 'payment',
            'payment_intent_data' => [
                'setup_future_usage' => 'off_session',
                'capture_method' => $captureMethod,
            ],
            'success_url' => route('fan.go.thanks', ['id' => $order->group_order_id, 'order_id' => $order->id]),
            'cancel_url' => route('fan.go.detail', $order->group_order_id),
            'metadata' => [
                'order_id' => $order->id,
                'fan_id' => $order->fan_id,
                'type' => $options['metadata']['type'] ?? 'group_order_new_card'
            ],
        ]);
    }

    /**
     * バッチ用: 保存済みカードに対して決済を実行する
     */
    public function captureSavedCardPayment(Order $order, PaymentMethod $paymentMethod)
    {
        try {
            [$currencyCode, $stripeAmount] = $this->getSettlementDetails($order);

            // 【ここも同様にprovider_idへ完全大掃除！】
            $pmId = $paymentMethod->provider_id;

            if (empty($pmId) && isset($paymentMethod->id)) {
                $pmId = DB::table('payment_methods')
                    ->where('id', $paymentMethod->id)
                    ->value('provider_id');
            }

            if (empty($pmId)) {
                throw new \Exception("Batch Execution Cancelled: Target card record lacks a valid provider_id token.");
            }

            return PaymentIntent::create([
                'amount' => $stripeAmount,
                'currency' => $currencyCode,
                'customer' => $order->fan->stripe_customer_id,
                'payment_method' => $pmId,
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
        $currency = $order->currency ?? Currency::find($order->currency_id);
        $currencyCode = strtolower($currency?->code ?? 'jpy');
        $rate = (float) ($currency?->exchange_rate ?? 1.0);

        if ($order->settlement_amount > 0) {
            $amount = $order->settlement_amount;
        } else {
            $amount = $rate > 0 ? floor($order->total_amount / $rate) : $order->total_amount;
        }

        $stripeAmount = $this->convertToStripeAmount($amount, $currencyCode);

        return [$currencyCode, $stripeAmount];
    }

    /**
     * 通貨に応じたStripe用最小単位（サブユニット）への変換
     */
    private function convertToStripeAmount($amount, $currencyCode): int
    {
        $zeroDecimalCurrencies = [
            'jpy', 'krw', 'vnd', 'clp', 'isk', 'ugx'
        ];

        if (in_array(strtolower($currencyCode), $zeroDecimalCurrencies)) {
            return (int) $amount;
        }

        return (int) round($amount * 100);
    }
}