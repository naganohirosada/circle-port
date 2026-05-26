<?php
namespace App\Services\Checkout;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\PaymentBreakdown;
use App\Models\ProductVariant;
use App\Models\Currency;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;
use App\Services\Fan\CartService;
use Illuminate\Support\Facades\Log;
use App\Models\PaymentMethod as MyPaymentMethod;
use App\Services\Common\StripeService;

class CheckoutService
{
    protected $orderRepo;
    protected $cartService;
    protected $stripeService;

    public function __construct(
        OrderRepositoryInterface $orderRepo,
        CartService $cartService,
        StripeService $stripeService
    ) {
        $this->orderRepo = $orderRepo;
        $this->cartService = $cartService;
        $this->stripeService = $stripeService;
    }

    /**
     * 通常注文処理実行（カートからのチェックアウト）
     */
    public function execute(
        $fan,
        array $cartData,
        int $paymentMethodId,
        int $shippingAddressId,
        array $selectedCartKeys,
        bool $isGoOrder = false,
        array $tips = []
    ) {
        $cartItem = $cartData['items'];
        if (empty($cartItem)) {
            throw new \Exception(__('Cart is empty.'));
        }

        $myPaymentMethod = MyPaymentMethod::where('id', $paymentMethodId)
            ->where('fan_id', $fan->id)
            ->first();

        if (!$myPaymentMethod) {
            throw new \Exception(__('Selected payment method is invalid.'));
        }

        return DB::transaction(function () use ($fan, $cartItem, $cartData, $myPaymentMethod, $shippingAddressId, $selectedCartKeys, $isGoOrder, $tips) {
            // 1. 在庫の厳格な行ロックチェック
            $this->validateAndLockStock($cartItem);

            // 2. 5/20新決済数式に基づく1次決済金額算出
            $amounts = $this->calculateFirstPhaseAmounts($cartItem, $isGoOrder, $tips);

            // 3. 多通貨対応：外貨基準レート（0.0094等）に対応した正しい「割り算」へ大リファクタリング！
            $currency = $fan->currency ?? Currency::where('code', 'JPY')->first();
            $baseRate = (float) ($currency->exchange_rate ?? 1.0);
            
            // 日本円以外の場合、5%の為替スプレッドを正確に適用
            $spread = ($currency->code === 'JPY') ? 1.0 : (1.0 + config('circleport.checkout.forex_spread_max', 0.05));
            $rate = $baseRate * $spread;

            // 【核心バグ修正大掃除】：外貨基準レートのため、掛け算ではなく「割り算」で本来の高額外貨（ルピア等）を導出！
            $settlementAmount = $rate > 0 ? floor($amounts['total'] / $rate) : $amounts['total'];

            // 4. データ構造の整形と仮登録
            $preparedData = $this->prepareOrderData(
                $fan, 
                $amounts,
                $cartItem,
                $shippingAddressId,
                $myPaymentMethod->id,
                'pm_pending_' . Str::random(10),
                $currency,
                $rate,
                $settlementAmount,
                $isGoOrder
            );

            $order = $this->orderRepo->createWithDetails($preparedData);

            try {
                // 5. Stripeによる安全な実決済実行（Off-Sessionカードチャージ）
                $paymentIntent = $this->stripeService->chargeSavedCard($order, $myPaymentMethod);

                if ($paymentIntent && $paymentIntent->status === 'succeeded') {
                    // 6. 決済成功：ステータスを『支払済』へ昇格
                    $order->update(['status' => Order::STATUS_PAID]);
                    if ($order->payment) {
                        $order->payment->update([
                            'external_transaction_id' => $paymentIntent->id,
                            'status' => Payment::STATUS_SUCCEEDED
                        ]);
                    }

                    // 7. 在庫を減算し、カートから購入対象商品をクリーンに消去
                    $this->reduceStock($cartItem);
                    $this->cartService->removeItemsFromSession($selectedCartKeys);

                    return $order;
                } else {
                    throw new \Exception(__('Payment authentication failed or required.'));
                }

            } catch (\Exception $stripeException) {
                Log::warning("Stripe Checkout Execution Failed [Order ID: {$order->id}]: " . $stripeException->getMessage());
                throw new \Exception(__('Payment declined. ') . $stripeException->getMessage());
            }
        });
    }

    private function validateAndLockStock(array $items)
    {
        foreach ($items as $item) {
            if (isset($item['variation_id']) && !empty($item['variation_id'])) {
                ProductVariant::where('id', $item['variation_id'])->lockForUpdate()->first();
            } else {
                Product::where('id', $item['id'])->lockForUpdate()->first();
            }
        }
    }

    private function reduceStock(array $items)
    {
        foreach ($items as $item) {
            $vId = $item['variation_id'] ?? null;
            if ($vId) {
                ProductVariant::where('id', $vId)->decrement('stock_quantity', $item['quantity']);
            } else {
                Product::where('id', $item['id'])->decrement('stock_quantity', $item['quantity']);
            }
        }
    }

    /**
     * 保存用データの整形
     */
    private function prepareOrderData(
        $fan, $amounts, $cartData, $addressId, $pmId, $txId, $currency, $rate, $settlementAmount, $isGoOrder
    ): array {
        $currencyId = $currency->id ?? config('circleport.default_currency_id');

        return [
            'order' => [
                'fan_id'              => $fan->id,
                'address_id'          => $addressId,
                'payment_method_id'   => $pmId,
                'total_amount'        => $amounts['total'], 
                'currency_id'         => $currencyId,
                'settlement_currency' => $currency->code, 
                'settlement_rate'     => $rate,           
                'settlement_amount'   => $settlementAmount, 
                'is_go_order'         => $isGoOrder,        
                'status'              => Order::STATUS_PAID,
            ],
            'items' => array_map(fn($item) => [
                'product_id'         => $item['id'],
                'product_variant_id' => isset($item['variation_id']) && !empty($item['variation_id']) ? $item['variation_id'] : null,
                'quantity'           => $item['quantity'],
                'unit_price'         => $item['price'],
            ], $cartData),
            'payment' => [
                'external_transaction_id' => $txId,
                'total_amount'            => $amounts['total'],
                'currency_id'             => $currencyId,
                'status'                  => Payment::STATUS_SUCCEEDED,
                'method_type'             => Payment::METHOD_CARD,
            ],
            'breakdowns' => array_filter([
                ['type' => PaymentBreakdown::TYPE_ITEM_TOTAL, 'amount' => $amounts['item_total'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_ITEM_TAX, 'amount' => 0, 'currency_id' => $currencyId], 
                ['type' => PaymentBreakdown::TYPE_HANDLING_FEE, 'amount' => $amounts['fee'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_DOMESTIC_SHIPPING, 'amount' => $amounts['warehouse_handling_fee'], 'currency_id' => $currencyId], 
                ['type' => PaymentBreakdown::TYPE_SHIPPING_TAX, 'amount' => 0, 'currency_id' => $currencyId],
            ]),
        ];
    }

    private function calculateFirstPhaseAmounts(array $cartItems, bool $isGoOrder = false, array $tips = []): array
    {
        if (empty($cartItems)) {
            throw new \Exception(__('Cart items are empty.'));
        }

        $feeRate = config('circleport.checkout.gateway_fee_rate', 0.08);

        $itemTotal = 0;
        $totalQuantity = 0;
        $hasPhysical = false;

        foreach ($cartItems as $item) {
            $qty = (int) $item['quantity'];
            $totalQuantity += $qty;

            $itemPrice = (int) ($item['price'] ?? 0);
            $itemTotal += $itemPrice * $qty;

            $product = Product::find($item['id']);
            if ($product && $product->product_type === Product::TYPE_PHYSICAL) {
                $hasPhysical = true;
            }
        }

        $warehouseHandlingFee = $hasPhysical ? ($totalQuantity * 500) : 0;
        $baseTotalForFee = $itemTotal + $warehouseHandlingFee;
        $fee = (int) ceil($baseTotalForFee * $feeRate);
        $tipTotal = array_sum($tips);
        $grandTotal = $baseTotalForFee + $fee + $tipTotal;

        return [
            'item_total'             => $itemTotal,
            'warehouse_handling_fee' => $warehouseHandlingFee,
            'fee'                    => $fee,
            'tip_total'              => $tipTotal,
            'total'                  => $grandTotal,
        ];
    }
}