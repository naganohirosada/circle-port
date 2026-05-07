<?php
namespace App\Services\Checkout;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\PaymentBreakdown;
use App\Models\ProductVariant;
use App\Models\Currency; // 追加
use App\Models\Address; // 追加：住所モデル
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
        array $selectedCartKeys,
        bool $isGoOrder = false,
        array $tips = []
    ) {
        $cartItem = $cartData['items'];
        if (empty($cartItem)) {
            throw new \Exception(__('Cart is empty.'));
        }

        return DB::transaction(function () use ($fan, $cartItem, $cartData, $paymentMethodId, $shippingAddressId, $selectedCartKeys, $isGoOrder, $tips) {
            // 1. 在庫の悲観的ロックとチェック
            // 既存ロジック：各アイテムの在庫を確認
            $this->validateAndLockStock($cartItem);

            // 2. 国際配送かどうかを判定
            $address = Address::find($shippingAddressId);
            $isInternational = $address && $address->country_code !== 'JP';

            // 3. サーバーサイドで正確な金額を計算（日本円ベース）
            // 憲法第1条に基づき再計算
            $amounts = $this->calculateFirstPhaseAmounts($cartItem, $isGoOrder, $isInternational, $tips);

            // 4. 【多通貨対応】外貨決済額の計算
            // ファンの優先通貨を取得し、決済時のレートと外貨額（切り捨て）を算出
            $currency = $fan->currency ?? Currency::where('code', 'JPY')->first();
            $rate = (float) ($currency->exchange_rate ?? 1.0);
            $settlementAmount = floor($amounts['total'] * $rate);

            // 5. 外部決済（Stripe等）の実行（本来はここでStripeServiceを呼び出す想定）
            $txId = 'pi_test_' . Str::random(20); 

            // 6. データの準備（多通貨情報を追加して渡す）
            $preparedData = $this->prepareOrderData(
                $fan, 
                $amounts,
                $cartItem,
                $shippingAddressId,
                $paymentMethodId,
                $txId,
                $currency,         // 追加：通貨モデル
                $rate,             // 追加：決済レート
                $settlementAmount,  // 追加：外貨額
                $isGoOrder,        // 追加：GO注文フラグ
                $isInternational   // 追加：国際配送フラグ
            );

            // 7. Repository を通じて一括保存
            $order = $this->orderRepo->createWithDetails($preparedData);

            // 8. 在庫を実際に減らす
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
    private function prepareOrderData($fan, $amounts, $cartData, $addressId, $pmId, $txId, $currency, $rate, $settlementAmount, $isGoOrder, $isInternational = false): array
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
                'is_go_order'       => $isGoOrder,        // 追加：GO注文フラグ
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
            'breakdowns' => array_filter([
                ['type' => PaymentBreakdown::TYPE_ITEM_TOTAL, 'amount' => $amounts['item_total'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_ITEM_TAX, 'amount' => $amounts['item_tax'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_HANDLING_FEE, 'amount' => $amounts['fee'], 'currency_id' => $currencyId],
                ['type' => ($isInternational ? PaymentBreakdown::TYPE_INTL_SHIPPING : PaymentBreakdown::TYPE_DOMESTIC_SHIPPING), 'amount' => $amounts['shipping'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_SHIPPING_TAX, 'amount' => $amounts['shipping_tax'], 'currency_id' => $currencyId],
                // 国際配送手数料を追加
                ($isInternational ? ['type' => PaymentBreakdown::TYPE_HANDLING_FEE, 'amount' => $amounts['international_fee'], 'currency_id' => $currencyId] : null),
            ]),
        ];
    }

    /**
     * 一次決済金額の計算（チップ対応版）
     * * @param array $cartItems 
     * @param bool $isGoOrder 
     * @param bool $isInternational 
     * @param array $tips クリエイターIDをキーとしたチップ額の配列 ['creator_id' => amount, ...]
     */
    private function calculateFirstPhaseAmounts(
        array $cartItems, 
        bool $isGoOrder = false, 
        bool $isInternational = false,
        array $tips = [] // 追加
    ): array {
        $taxRate  = config('circleport.checkout.tax_rate', 0.10);

        // 1. 手数料率の設定（GO注文 5% / 通常 8%）
        $feeRate = $isGoOrder
            ? config('circleport.checkout.go_gateway_fee_rate', 0.05)
            : config('circleport.checkout.gateway_fee_rate', 0.08);

        // 国際配送の場合の追加システム利用料 (3%)
        $internationalFeeRate = $isInternational ? config('circleport.checkout.international_gateway_fee_rate', 0.03) : 0;

        // 2. 商品合計額の算出
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

        // 3. 配送料の設定
        if ($isInternational) {
            // 国際配送：300円のバンドリング手数料（資材・ハンドリング無料戦略）
            $shipping = config('circleport.checkout.international_bundling_fee', 300);
        } else {
            // 国内配送：config から取得した標準配送料金
            $shipping = config('circleport.checkout.domestic_shipping_fee', 1200);
        }

        // 4. 税金計算（日本国内取引として各項目 floor 後に合算）
        $itemTax     = floor($itemTotal * $taxRate);
        $shippingTax = floor($shipping * $taxRate);
        $totalTax    = $itemTax + $shippingTax;

        // 5. システム手数料の計算ベース（商品 + 送料 + 税）
        $totalBeforeFee = $itemTotal + $shipping + $totalTax;

        // 6. 各種システム手数料の算出（1円未満切り上げ）
        $gatewayFee       = ceil($totalBeforeFee * $feeRate);
        $internationalFee = $isInternational ? ceil($totalBeforeFee * $internationalFeeRate) : 0;

        // 7. 【追加】クリエイターチップ合計の算出
        // チップは「応援」のため、プラットフォーム手数料（8%等）の対象外として合算
        $tipTotal = array_sum($tips);

        // 8. 最終合計額（ファンへの請求総額）
        $grandTotal = $totalBeforeFee + $gatewayFee + $internationalFee + $tipTotal;

        return [
            'item_total'        => $itemTotal,
            'item_tax'          => $itemTax,
            'shipping'          => $shipping,
            'shipping_tax'      => $shippingTax,
            'fee'               => $gatewayFee,
            'international_fee' => $internationalFee,
            'tip_total'         => $tipTotal, // 追加：チップ合計
            'total'             => $grandTotal, // チップを含めた最終決済額
        ];
    }
}