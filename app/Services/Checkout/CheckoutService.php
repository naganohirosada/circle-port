<?php
namespace App\Services\Checkout;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\PaymentBreakdown;
use App\Models\ProductVariant;
use App\Models\Currency; // 追加
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Str;
use App\Services\Fan\CartService;


class CheckoutService
{
    protected $orderRepo;
    protected $cartService;

    public function __construct(
        OrderRepositoryInterface $orderRepo,
        CartService $cartService
    ) {
        $this->orderRepo = $orderRepo;
        $this->cartService = $cartService;
    }

    /**
     * 注文処理実行
     */
    public function execute(
        $fan,
        array $cartData,
        int $paymentMethodId,
        int $shippingAddressId,
        array $selectedCartKeys
    ) {
        $cartItem = $cartData['items'];
        if (empty($cartItem)) {
            throw new \Exception(__('Cart is empty.'));
        }

        return DB::transaction(function () use ($fan, $cartItem, $cartData, $paymentMethodId, $shippingAddressId, $selectedCartKeys) {
            // 1. 在庫の悲観的ロックとチェック
            // 既存ロジック：各アイテムの在庫を確認
            $this->validateAndLockStock($cartItem);

            // 2. サーバーサイドで正確な金額を計算（日本円ベース）
            // 憲法第1条に基づき再計算
            $amounts = $this->calculateFirstPhaseAmounts($cartItem);

            // 3. 【多通貨対応】外貨決済額の計算
            // ファンの優先通貨を取得し、決済時のレートと外貨額（切り捨て）を算出
            $currency = $fan->currency ?? Currency::where('code', 'JPY')->first();
            $rate = (float) ($currency->exchange_rate ?? 1.0);
            $settlementAmount = floor($amounts['total'] * $rate);

            // 4. 外部決済（Stripe等）の実行（本来はここでStripeServiceを呼び出す想定）
            $txId = 'pi_test_' . Str::random(20); 

            // 5. データの準備（多通貨情報を追加して渡す）
            $preparedData = $this->prepareOrderData(
                $fan, 
                $amounts,
                $cartItem,
                $shippingAddressId,
                $paymentMethodId,
                $txId,
                $currency,         // 追加：通貨モデル
                $rate,             // 追加：決済レート
                $settlementAmount  // 追加：外貨額
            );

            // 6. Repository を通じて一括保存
            $order = $this->orderRepo->createWithDetails($preparedData);

            // 7. 在庫を実際に減らす
            $this->reduceStock($cartItem);

            // カート内を削除
            $this->cartService->removeItemsFromSession($selectedCartKeys);

            return $order;
        });
    }

    /**
     * 在庫のロックとチェック（既存維持）
     */
    private function validateAndLockStock(array $items)
    {
        foreach ($items as $item) {
            if (isset($item['variation_id']) && !empty($item['variation_id'])) {
                $variation = ProductVariant::where('id', $item['variation_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$variation || $variation->stock < $item['quantity']) {
                    throw new Exception(__('Sorry, some items are out of stock.'));
                }
            }
        }
    }

    /**
     * 在庫減少処理（既存維持）
     */
    private function reduceStock(array $items)
    {
        foreach ($items as $item) {
            $variationId = $item['variation_id'] ?? null;

            if ($variationId) {
                ProductVariant::where('id', $variationId)->decrement('stock', $item['quantity']);
            } else {
                Product::where('id', $item['id'])->decrement('stock_quantity', $item['quantity']);
            }
        }
    }

    /**
     * 保存用データの整形（多通貨決済情報を統合）
     */
    private function prepareOrderData($fan, $amounts, $cartData, $addressId, $pmId, $txId, $currency, $rate, $settlementAmount): array
    {
        $currencyId = $currency->id ?? config('circleport.default_currency_id');

        return [
            'order' => [
                'fan_id'            => $fan->id,
                'address_id'        => $addressId,
                'payment_method_id' => $pmId,
                'total_amount'      => $amounts['total'], // JPYベース合計
                'currency_id'       => $currencyId,
                'settlement_currency' => $currency->code, // 追加：決済通貨コード
                'settlement_rate'     => $rate,           // 追加：決済時のレート
                'settlement_amount'   => $settlementAmount, // 追加：決済外貨額
                'status'            => Order::STATUS_PAID,
            ],
            'items' => array_map(fn($item) => [
                'product_id'           => $item['id'],
                'product_variant_id' => isset($item['variation_id']) && !empty($item['variation_id']) ? $item['variation_id'] : null,
                'quantity'             => $item['quantity'],
                'unit_price'           => $item['price'],
            ], $cartData),
            'payment' => [
                'external_transaction_id' => $txId,
                'total_amount'            => $amounts['total'],
                'currency_id'             => $currencyId,
                'status'                  => Payment::STATUS_SUCCEEDED,
                'method_type'             => Payment::METHOD_CARD,
            ],
            'breakdowns' => [
                ['type' => PaymentBreakdown::TYPE_ITEM_TOTAL, 'amount' => $amounts['item_total'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_ITEM_TAX, 'amount' => $amounts['item_tax'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_HANDLING_FEE, 'amount' => $amounts['fee'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_DOMESTIC_SHIPPING, 'amount' => $amounts['shipping'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_SHIPPING_TAX, 'amount' => $amounts['shipping_tax'], 'currency_id' => $currencyId],
            ],
        ];
    }

    /**
     * 金額再計算ロジック（既存維持）
     */
    private function calculateFirstPhaseAmounts(array $cartItems): array
    {
        $shipping = config('circleport.checkout.domestic_shipping_fee', 500);
        $taxRate  = config('circleport.checkout.tax_rate', 0.10);
        $feeRate  = config('circleport.checkout.gateway_fee_rate', 0.08);

        $itemTotal = 0;
        foreach ($cartItems as $item) {
            $vId = $item['variation_id'] ?? null;
            if ($vId) {
                $variation = ProductVariant::findOrFail($vId);
                $itemTotal += $variation->price * $item['quantity'];
            } else {
                $product = Product::findOrFail($item['id']);
                $itemTotal += $product->price * $item['quantity'];
            }
        }

        $domesticShipping = $shipping;
        $itemTax     = floor($itemTotal * $taxRate);
        $shippingTax = floor($domesticShipping * $taxRate);
        $totalTax    = $itemTax + $shippingTax;

        $totalBeforeFee = $itemTotal + $domesticShipping + $totalTax;
        $gatewayFee     = ceil($totalBeforeFee * $feeRate);
        $grandTotal     = $totalBeforeFee + $gatewayFee;

        return [
            'item_total'   => $itemTotal,
            'item_tax'     => $itemTax,
            'shipping'     => $domesticShipping,
            'shipping_tax' => $shippingTax,
            'fee'          => $gatewayFee,
            'total'        => $grandTotal,
        ];
    }
}