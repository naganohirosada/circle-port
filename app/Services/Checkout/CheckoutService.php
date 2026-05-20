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
     * 注文処理実行
     * @param $fan
     * @param array $cartData
     * @param int $paymentMethodId
     * @param int $shippingAddressId
     * @param array $selectedCartKeys
     * @param bool $isGoOrder
     * @param array $tips
     * @return Order
     * @throws Exception
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

        // フロントから送られてきた自社DBの決済IDを元に、登録済みの決済情報を取得
        $myPaymentMethod = MyPaymentMethod::where('id', $paymentMethodId)
            ->where('fan_id', $fan->id)
            ->first();

        if (!$myPaymentMethod) {
            throw new \Exception(__('Selected payment method is invalid.'));
        }

        return DB::transaction(function () use ($fan, $cartItem, $cartData, $myPaymentMethod, $shippingAddressId, $selectedCartKeys, $isGoOrder, $tips) {
            $this->validateAndLockStock($cartItem);

            $amounts = $this->calculateFirstPhaseAmounts($cartItem, $isGoOrder, $shippingAddressId, $tips);

            // 3. 【多通貨対応】外貨決済額の計算（フロント表示およびStripe請求額と完全に同期）
            $currency = $fan->currency ?? Currency::where('code', 'JPY')->first();
            $baseRate = (float) ($currency->exchange_rate ?? 1.0);
            
            // 【修正】設定通貨が日本円以外の場合、5%の為替スプレッドを適用（外貨小数点1位の表示精度に対応）
            $spread = ($currency->code === 'JPY') ? 1.0 : (1.0 + config('circleport.checkout.forex_spread_max', 0.05));
            $rate = $baseRate * $spread;
            $settlementAmount = floor($amounts['total'] * $rate);

            // 5. 外部決済（Stripe等）の実行（本来はここでStripeServiceを呼び出す想定）
            $txId = 'pi_test_' . Str::random(20); 

            // 決済が成功するまではSTATUS_PENDING等にしておくことで、不意のカードエラー時の整合性を守ります
            $preparedData = $this->prepareOrderData(
                $fan, 
                $amounts,
                $cartItem,
                $shippingAddressId,
                $myPaymentMethod->id,
                'pm_pending_' . Str::random(10), // 仮のトランザクションID
                $currency,
                $rate,
                $settlementAmount,
                $isGoOrder
            );

            // 7. Repository を通じて一括保存
            $order = $this->orderRepo->createWithDetails($preparedData);

            try {
                // 6. 【本実装】Stripeの保存済みカード/マルチ決済手段（Off-Session）に対して実決済を実行
                $paymentIntent = $this->stripeService->chargeSavedCard($order, $myPaymentMethod);

                if ($paymentIntent && $paymentIntent->status === 'succeeded') {
                    // 7. 決済成功：注文と決済レコードを『完了』ステータスに昇格更新
                    $order->update(['status' => Order::STATUS_PAID]);
                    if ($order->payment) {
                        $order->payment->update([
                            'external_transaction_id' => $paymentIntent->id,
                            'status' => Payment::STATUS_SUCCEEDED
                        ]);
                    }

                    // 8. 在庫を実際に減少させ、カート内セッションを消去
                    $this->reduceStock($cartItem);
                    $this->cartService->removeItemsFromSession($selectedCartKeys);

                    return $order;
                } else {
                    throw new \Exception(__('Payment authentication failed or required.'));
                }

            } catch (\Exception $stripeException) {
                // 決済失敗時：ログに記録し、ロールバックのために例外を上に投げる
                Log::warning("Stripe Checkout Execution Failed [Order ID: {$order->id}]: " . $stripeException->getMessage());
                throw new \Exception(__('Payment declined. ') . $stripeException->getMessage());
            }
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

                if (!$variation || $variation->stock_quantity < $item['quantity']) {
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
                ProductVariant::where('id', $variationId)->decrement('stock_quantity', $item['quantity']);
            } else {
                Product::where('id', $item['id'])->decrement('stock_quantity', $item['quantity']);
            }
        }
    }

    /**
     * 保存用データの整形（多通貨決済情報を統合）
     * @param $fan
     * @param array $amounts
     * @param array $cartData   
     * @param int $addressId
     * @param int $pmId
     * @param string $txId
     * @param Currency $currency
     * @param float $rate
     * @param int $settlementAmount
     * @param bool $isGoOrder
     * @return array
     */
    private function prepareOrderData(
        $fan,
        $amounts,
        $cartData,
        $addressId,
        $pmId,
        $txId,
        $currency,
        $rate,
        $settlementAmount,
        $isGoOrder
    ): array {
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
                ['type' => PaymentBreakdown::TYPE_DOMESTIC_SHIPPING, 'amount' => $amounts['shipping'], 'currency_id' => $currencyId],
                ['type' => PaymentBreakdown::TYPE_SHIPPING_TAX, 'amount' => $amounts['shipping_tax'], 'currency_id' => $currencyId],
            ]),
        ];
    }

    /**
     * 一次決済金額の計算（チップ対応版）
     * * @param array $cartItems 
     * @param bool $isGoOrder 
     * @param int|null $shippingAddressId
     * @param array $tips クリエイターIDをキーとしたチップ額の配列 ['creator_id' => amount, ...]
     */
    private function calculateFirstPhaseAmounts(
        array $cartItems, 
        bool $isGoOrder = false, 
        int $shippingAddressId = null,
        array $tips = [] // 追加
    ): array {
        if (empty($cartItems)) {
            throw new \Exception(__('Cart items are empty.'));
        }

        $taxRate  = config('circleport.checkout.tax_rate', 0.10);
        $shippingAddress = $shippingAddressId ? Address::find($shippingAddressId) : null;
        $isDomestic = $shippingAddress ? ($shippingAddress->country_code === 'JP') : true;
        $isInternational = !$isDomestic;

        // 1. 手数料率の設定（GO注文 5% / 通常 8%）
        $feeRate = $isGoOrder
            ? config('circleport.checkout.go_gateway_fee_rate', 0.05)
            : config('circleport.checkout.gateway_fee_rate', 0.08);

        // 国際配送の場合の追加システム利用料 (3%)
        $internationalFeeRate = $isInternational ? config('circleport.checkout.international_gateway_fee_rate', 0.03) : 0;

        $itemTotal = 0;
        $hasPhysical = false;
        foreach ($cartItems as $item) {
            $vId = $item['variation_id'] ?? null;
            if ($vId) {
                $variation = ProductVariant::find($vId);
                $itemTotal += $variation->price * $item['quantity'];
                if ($variation->product->product_type === Product::TYPE_PHYSICAL) $hasPhysical = true;
            } else {
                $product = Product::find($item['id']);
                $itemTotal += $product->price * $item['quantity'];
                if ($product->product_type === Product::TYPE_PHYSICAL) $hasPhysical = true; 
            }
        }

        // 3. 【核心仕様】配送料の3パターン自動算出ロジック
        $shipping = 0;
        if ($hasPhysical) {
            if ($isInternational) {
                // パターンA: 国際配送（2段階決済の1次送料として倉庫中継バンドル費を適用）
                $shipping = config('circleport.checkout.international_bundling_fee', 500);
            } else {
                // 国内配送：同一クリエイターで送料が重複しないよう、ショップ毎に仕分け計算
                $shippingMatrix = [];
                
                foreach ($cartItems as $item) {
                    $product = null;
                    $vId = $item['variation_id'] ?? null;
                    if ($vId) {
                        $variation = ProductVariant::find($vId);
                        $product = $variation ? $variation->product : null;
                    } else {
                        $product = Product::find($item['id']);
                    }

                    if ($product) {
                        $cId = $product->creator_id;
                        if (!isset($shippingMatrix[$cId])) {
                            $shippingMatrix[$cId] = ['warehouse' => false, 'direct_fee' => 0];
                        }

                        // 10: 倉庫一括配送 (WAREHOUSE), 20: 自己発送 (DIRECT)
                        if ($product->domestic_shipping_method === 20) {
                            // 自己発送：同一クリエイター内の複数商品なら、設定送料の最大値を一括適用
                            $shippingMatrix[$cId]['direct_fee'] = max(
                                $shippingMatrix[$cId]['direct_fee'], 
                                (int)($product->domestic_direct_shipping_fee ?? 0)
                            );
                        } else {
                            // 倉庫一括配送フラグをON
                            $shippingMatrix[$cId]['warehouse'] = true;
                        }
                    }
                }

                // マトリクスから最終配送料をマージ
                foreach ($shippingMatrix as $creatorId => $info) {
                    if ($info['warehouse']) {
                        // パターンB: 国内一括配送（サークルポート規定の国内固定送料 800円）
                        $shipping += config('circleport.checkout.domestic_shipping_fee', 800);
                    }
                    // パターンC: 国内自己発送（クリエイターが自ら設定した配送料）
                    $shipping += $info['direct_fee'];
                }
            }
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