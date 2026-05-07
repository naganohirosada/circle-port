<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use Stripe\Stripe;
use App\Models\Language;
use App\Enums\PaymentStatus;
use App\Models\Fan;
use App\Models\Order; // 追加
use App\Models\InternationalShipping; // 追加
use App\Models\InternationalShippingItem;
use Illuminate\Support\Facades\DB; // 追加

class InternationalShippingService
{
    public function __construct(
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected PaymentMethodRepositoryInterface $paymentRepo
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * 同梱（まとめ配送）可能な注文一覧を取得
     * 条件：倉庫到着済み（STATUS_ARRIVED_AT_WAREHOUSE）かつ、まだ国際配送に紐付いていないもの
     * 通常注文・GO注文の両方が対象となります。
     */
    public function getConsolidatableOrders(int $fanId)
    {
        return Order::where('fan_id', $fanId)
            ->where('status', Order::STATUS_ARRIVED_AT_WAREHOUSE)
            ->where(function ($query) {
                // A. 国際配送レコードがまだ存在しない場合
                $query->whereDoesntHave('orderItems.internationalShippingItem')
                // B. または、配送レコードは存在するが「同梱に切り替え可能」な場合
                ->orWhereHas('orderItems.internationalShippingItem.internationalShipping', function ($q) {
                    $q->where('type', InternationalShipping::TYPE_REGULAR) // 通常配送のみ
                      ->whereIn('status', [10, 20]); // 見積もり中、または支払い待ち状態のみ
                });
            })
            ->with([
                'orderItems.product.images',
                'orderItems.product.translations' => function($query) {
                    $query->where('locale', app()->getLocale());
                },
                'orderItems.product.translations' => function($query) {
                    $query->where('locale', app()->getLocale());
                },
                'orderItems.internationalShippingItem'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * 複数注文をまとめた国際配送（同梱）依頼の実行
     */
    public function requestConsolidation(int $fanId, array $orderIds)
    {
        return DB::transaction(function () use ($fanId, $orderIds) {
            
            // --- A. 既存の（自動生成された）不要な配送レコードを特定 ---
            // 選択された OrderItem に紐付いている既存の配送IDを取得
            $oldShippingIds = InternationalShippingItem::whereIn('order_item_id', function($query) use ($orderIds) {
                $query->select('id')->from('order_items')->whereIn('order_id', $orderIds);
            })->pluck('international_shipping_id')->unique();

            // --- B. 新しい同梱配送レコード（TYPE_CONSOLIDATED）を作成 ---
            $newShipping = InternationalShipping::create([
                'fan_id' => $fanId,
                'type'   => InternationalShipping::TYPE_CONSOLIDATED,
                'status' => 10, // 依頼済み（再見積もり待ち）
                'shipping_fee' => 0,
            ]);

            // --- C. アイテムの紐付け替え ---
            $orders = Order::whereIn('id', $orderIds)->with('orderItems')->get();
            foreach ($orders as $order) {
                foreach ($order->orderItems as $item) {
                    $newShipping->items()->create([
                        'order_item_id' => $item->id,
                        'quantity' => $item->quantity,
                    ]);
                }
            }

            // --- D. 【重要】古い個別配送レコードの削除 ---
            if ($oldShippingIds->isNotEmpty()) {
                // まだ支払いが行われていないレコードのみを削除（安全策）
                // InternationalShippingItem は database の CASCADE 設定、または手動で削除
                InternationalShipping::whereIn('id', $oldShippingIds)
                    ->whereIn('status', [10, 20])
                    ->delete();
            }

            return $newShipping;
        });
    }

    /**
     * 送料決済用のStripeセッションを作成
     */
    /**
     * 送料決済用のStripeセッションを作成 (既存メソッド)
     */
    public function createCheckoutSession(int $id, int $fanId): string
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        
        $shipping = $this->intlRepo->findForPayment($id, $fanId);
        $fan = Fan::findOrFail($fanId);

        $payment = $shipping->payments()
            ->where('status', PaymentStatus::PENDING)
            ->latest()
            ->first();

        if (!$payment) {
            throw new \Exception("Payment record not found for shipping ID: {$id}");
        }

        $customerId = $fan->stripe_customer_id;

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
     * ファンの言語設定に合わせた配送一覧を取得 (既存メソッド)
     */
    public function getShippingListForFan(Fan $user)
    {
        $locale = app()->getLocale();

        return $this->intlRepo->getListForFan($user->id, $locale);
    }
}