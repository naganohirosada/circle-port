<?php

namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\CreatorRepositoryInterface;
use App\Models\GroupOrder;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentBreakdown;

class CreatorRepository implements CreatorRepositoryInterface
{
    public function getGroupOrders(int $creatorId)
    {
        return GroupOrder::where('creator_id', $creatorId)
            ->withCount('participants')
            ->with(['items'])
            ->latest()
            ->get();
    }

    public function getRecentRegularOrders(int $creatorId, int $limit = 10)
    {
        return Order::whereDoesntHave('groupOrderParticipant')
            ->whereHas('orderItems.product', function($q) use ($creatorId) {
                $q->where('creator_id', $creatorId);
            })
            ->with([
                'orderItems.product',
                // モデルに合わせて payment (単数) でロード
                'payment' => function($q) {
                    $q->where('status', Payment::STATUS_SUCCEEDED)
                    ->with('breakdowns');
                }
            ])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * クリエイターの総売上（商品代金の合計）を計算
     * payment_breakdown から 'item_total' タイプのみを合計する
     */
    public function getTotalEarnings(int $creatorId)
    {
        // クリエイターの今月の売上 = 今月作成された 商品代(1) + 商品の税(5)
        return PaymentBreakdown::whereIn('type', [
                PaymentBreakdown::TYPE_ITEM_TOTAL, 
                PaymentBreakdown::TYPE_ITEM_TAX
            ]) 
            ->whereMonth('created_at', now()->month) // 現在の月
            ->whereYear('created_at', now()->year)   // 現在の年
            ->whereHas('payment', fn($q) => $q->where('status', Payment::STATUS_SUCCEEDED))
            ->whereHas('payment.order.orderItems.product', function($q) use ($creatorId) {
                $q->where('creator_id', $creatorId);
            })
            ->sum('amount');
    }

    /**
     * 商品代金の合計（getTotalEarningsと同じロジック、あるいは特定の期間絞り込み用）
     */
    public function getItemSalesTotal(int $creatorId)
    {
        // 基本的には上記と同じロジックで「純粋な商品売上」を返す
        return $this->getTotalEarnings($creatorId);
    }
}