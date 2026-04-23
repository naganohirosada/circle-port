<?php
namespace App\Repositories\Eloquent\Order;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;

class OrderRepository implements OrderRepositoryInterface
{
    /**
     * 注文情報登録
     * @param array $orderData
     * @param array $items
     * @param array $paymentData
     * @param array breakdowns
     */
    public function createOrder(array $orderData, array $items, array $paymentData, array $breakdowns): Order
    {
        // 憲法第1条：データの不整合を防ぐため、必ずトランザクション内で実行
        return DB::transaction(function () use ($orderData, $items, $paymentData, $breakdowns) {
            // 1. 注文の作成
            $order = Order::create($orderData);
            // 2. 注文明細の作成
            foreach ($items as $item) {
                $order->orderItems()->create($item);
            }
            // 3. 決済情報の作成
            $payment = $order->payment()->create($paymentData);
            // 4. 決済内訳の作成
            foreach ($breakdowns as $breakdown) {
                $payment->breakdowns()->create($breakdown);
            }
            return $order;
        });
    }

    /**
     * 注文情報取得
     * @param int $orderId
     */
    public function findWithDetails(int $orderId): ?Order
    {
        return Order::with([
            'orderItems.product', 
            'orderItems.variation', 
            'payment.breakdowns.currency',
            'shippingAddress',
            'currency'
        ])->find($orderId);
    }

    /**
     * 注文、明細、決済、内訳をアトミックに保存する
     * @param array $data
     */
    public function createWithDetails(array $data): Order
    {
        // 憲法第1条：すべての保存処理を一つのトランザクションに包む
        return DB::transaction(function () use ($data) {
            
            // 1. 注文レコードの作成 (shipping_address_id, payment_method_id等を含む)
            $order = Order::create($data['order']);

            // 2. 注文明細 (OrderItems) の作成
            foreach ($data['items'] as $item) {
                $order->orderItems()->create($item);
            }

            // 3. 決済記録 (Payments) の作成
            $payment = $order->payment()->create($data['payment']);

            // 4. 決済内訳 (PaymentBreakdowns) の作成
            // 商品代、送料、税、手数料をそれぞれ別レコードとして保存
            foreach ($data['breakdowns'] as $breakdown) {
                $payment->breakdowns()->create($breakdown);
            }

            if ((int)$payment->status === 20) {
                app(\App\Services\PayoutService::class)->recordPaymentToPayout($payment);
            }

            return $order;
        });
    }

    /**
     * 指定されたステータスの注文数をカウントする
     * @param int $fanId
     * @param string $status
     */
    public function countByStatus(int $fanId, string $status): int
    {
        return Order::where('fan_id', $fanId)
            ->where('status', $status)
            ->count();
    }

    public function getPaginatedForFan(int $fanId, int $perPage = 10) {
        return Order::where('fan_id', $fanId)
            ->with([
                'orderItems.product.translations',
                'orderItems.product.images',
                'orderItems.variation.translations'
            ])
            ->latest()
            ->paginate($perPage);
    }
}