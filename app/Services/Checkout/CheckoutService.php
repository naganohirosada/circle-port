<?php
namespace App\Services\Checkout;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\PaymentBreakdown;
use App\Models\ProductVariant;
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
     * @param $fan
     * @param array $cartData
     * @param int $paymentMethodId
     * @param int addressId
     * @param array $selectedCartKeys
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

        return DB::transaction(function () use ($fan, $cartItem, $shippingAddressId, $paymentMethodId, $selectedCartKeys) {
            // 1. 在庫の悲観的ロックとチェック
            if (!empty($cartItem['variation_id'])) {
                $this->validateAndLockStock($cartItem);
            }

            // 2. 【重要】ここで使う！：サーバーサイドで正確な金額を計算
            // フロントの金額改ざんを物理的に無効化します（憲法第1条）
            $amounts = $this->calculateFirstPhaseAmounts($cartItem);

            // 3. 外部決済（Stripe等）の実行
            // calculateFirstPhaseAmounts で出した $amounts['total'] を請求します
            $txId = 'pi_test_' . Str::random(20); 

            // 計算済みの $amounts を渡すように微修正して呼び出し
            $preparedData = $this->prepareOrderData(
                $fan, 
                $amounts,           // 再計算した金額データ
                $cartItem,         // 明細データ
                $shippingAddressId, // 選択された配送先
                $paymentMethodId,   // 選択された決済方法
                $txId               // 決済ID
            );

            // 5. Repository を通じて一括保存
            $order = $this->orderRepo->createWithDetails($preparedData);

            // 6. 在庫を実際に減らす
            $this->reduceStock($cartItem);

            // カート内を削除
            $this->cartService->removeItemsFromSession($selectedCartKeys);

            return $order;
        });
    }

    /**
     * 
     * @param array $items
     */
    private function validateAndLockStock(array $items)
    {
        foreach ($items as $item) {
            $variation = ProductVariant::where('id', $item['variation_id'])
                ->lockForUpdate()
                ->first();

            if (!$variation || $variation->stock < $item['quantity']) {
                throw new Exception(__('Sorry, some items are out of stock.'));
            }
        }
    }

    /**
     * 
     * @param array $items
     */
    private function reduceStock(array $items)
    {
        foreach ($items as $item) {
            $variationId = $item['variation_id'] ?? null;

            if ($variationId) {
                // 1. バリエーションがある場合：ProductVariant の在庫を減らす
                ProductVariant::where('id', $variationId)
                    ->decrement('stock', $item['quantity']);
            } else {
                // 2. バリエーションがない場合：Product 本体の在庫を減らす
                // $item['id'] は商品（Product）のIDを指している想定
                Product::where('id', $item['id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }
        }
    }

    /**
     * 
     * @param $fan
     * @param $cartData
     * @param $pmId
     * @param $txId
     */
    private function prepareOrderData($fan, $amounts, $cartData, $addressId, $pmId, $txId): array
    {
        $currencyId = $fan->currency_id ?? config('circleport.default_currency_id');
        return [
            'order' => [
                'fan_id' => $fan->id,
                'address_id' => $addressId,
                'payment_method_id' => $pmId,
                'total_amount' => $amounts['total'],
                'currency_id' => $currencyId,
                'status' => Order::STATUS_PAID,
            ],
            'items' => array_map(fn($item) => [
                'product_id' => $item['id'],
                'product_variation_id' => isset($item['variation_id']) && !empty($item['variation_id']) ? $item['variation_id'] :null,
                'quantity' => $item['quantity'],
                'unit_price' => $item['price'],
            ], $cartData),
            'payment' => [
                'external_transaction_id' => $txId,
                'total_amount' => $amounts['total'],
                'currency_id' => $fan->currency_id,
                'status' => Payment::STATUS_SUCCEEDED,
                'method_type' => Payment::METHOD_CARD,
            ],
            'breakdowns' => [
                ['type' => PaymentBreakdown::TYPE_ITEM_TOTAL, 'amount' => $amounts['item_total'], 'currency_id' => $fan->currency_id],
                ['type' => PaymentBreakdown::TYPE_DOMESTIC_SHIPPING, 'amount' => $amounts['shipping'], 'currency_id' => $fan->currency_id],
                ['type' => PaymentBreakdown::TYPE_HANDLING_FEE, 'amount' => $amounts['fee'], 'currency_id' => $fan->currency_id],
            ],
        ];
    }

    /**
     * 
     * @param array $cartItems
     */
    private function calculateFirstPhaseAmounts(array $cartItems)
    {
        $shipping = config('circleport.checkout.domestic_shipping_fee');
        $taxRate  = config('circleport.checkout.tax_rate');
        $feeRate  = config('circleport.checkout.gateway_fee_rate');

        // 1. 商品代金合計
        $itemTotal = 0;
        foreach ($cartItems as $item) {
            // 論理削除されていない、最新の価格を取得
            $vId = $item['variation_id'] ?? null;

            if ($vId) {
                $variation = ProductVariant::findOrFail($vId);
                $itemTotal += $variation->price * $item['quantity'];
            } else {
                // バリエーションがない商品の場合、Productモデル自体の価格を参照するなどのフォールバック
                $product = Product::findOrFail($item['id']);
                $itemTotal += $product->price * $item['quantity'];
            }
        }

        // 2. 国内送料 (固定額: 700円)
        $domesticShipping = $shipping;

        // 3. 国内消費税 (10%)
        // (商品代 + 送料) に対して課税。1円未満は切り捨て(floor)
        $taxableAmount = $itemTotal + $domesticShipping;
        $tax = floor($taxableAmount * $taxRate);

        // 4. 決済手数料 (7.5%)
        // (商品代 + 送料 + 消費税) の総額に対して 7.5%
        // 憲法第3条：コスト回収のため、1円未満は「切り上げ(ceil)」
        $totalBeforeFee = $taxableAmount + $tax;
        $gatewayFee = ceil($totalBeforeFee * $feeRate);

        // 5. 最終合計額 (ファンへの請求額)
        $grandTotal = $totalBeforeFee + $gatewayFee;

        return [
            'item_total' => $itemTotal,
            'shipping'   => $domesticShipping,
            'tax'        => $tax,
            'fee'        => $gatewayFee,
            'total'      => $grandTotal,
        ];
    }
}