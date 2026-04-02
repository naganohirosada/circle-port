<?php
namespace App\Repositories\Interfaces;

use App\Models\Order;

interface OrderRepositoryInterface
{
    /**
     * 注文とその関連データ（明細、決済、内訳）を一括で作成する
     * @param array $orderData
     * @param array $items
     * @param array $paymentData
     * @param array $breakdowns
     */
    public function createOrder(array $orderData, array $items, array $paymentData, array $breakdowns): Order;

    /**
     * IDから注文を取得（Eager Loading 憲法第4条準拠）
     * @param int $orderId
     */
    public function findWithDetails(int $orderId): ?Order;

    /**
     * 注文、明細、決済、内訳をアトミックに保存する
     * @param array $data
     */
    public function createWithDetails(array $data): Order;
}