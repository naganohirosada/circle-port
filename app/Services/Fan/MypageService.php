<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\GroupOrder;
use App\Models\InternationalShipping;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Order;

class MypageService
{

    protected $orderRepo;

    public function __construct(OrderRepositoryInterface $orderRepo)
    {
        $this->orderRepo = $orderRepo;
    }

    /**
     * それぞれのカウントを取得
     * @param int $fanId
     */
    public function getPurchaseStats(int $fanId): array
    {
        return [
            'ordered_count'       => $this->orderRepo->countByStatus($fanId, Order::STATUS_PAID),
            'warehouse_count'     => $this->orderRepo->countByStatus($fanId, Order::STATUS_ARRIVED_AT_WAREHOUSE),
            'shipping_count'      => $this->orderRepo->countByStatus($fanId, Order::STATUS_SHIPPED_TO_WAREHOUSE),
            'consolidation_count' => $this->getConsolidationCount($fanId),
        ];
    }

    private function getConsolidationCount(int $fanId): int
    {
        return Order::where('fan_id', $fanId)
            ->where('status', Order::STATUS_ARRIVED_AT_WAREHOUSE)
            ->where(function ($query) {
                $query->whereDoesntHave('orderItems.internationalShippingItem')
                    ->orWhereHas('orderItems.internationalShippingItem.internationalShipping', function ($query) {
                        $query->where('type', InternationalShipping::TYPE_REGULAR)
                            ->whereIn('status', [10, 20]);
                    });
            })
            ->count();
    }

    /**
     * 主催したGroup Order一覧を取得
     */
    public function getOrganizedGroupOrders(int $fanId): Collection
    {
        return GroupOrder::where('manager_id', $fanId)
            ->with(['creator'])
            ->withCount([
                'items',
                'participants'
            ])
            ->latest()
            ->get();
    }

    public function getJoinedGroupOrders(int $fanId): Collection
    {
        return GroupOrder::whereHas('participants', function ($query) use ($fanId) {
                $query->where('fan_id', $fanId);
            })
            ->with(['creator'])
            ->withCount(['items', 'participants'])
            ->latest()
            ->get();
    }

    public function getShippingOrders(int $fanId): Collection
    {
        return Order::where('fan_id', $fanId)
            ->where('status', Order::STATUS_SHIPPED_TO_WAREHOUSE)
            ->with([
                'orderItems.product.translations',
                'orderItems.product.images',
                'orderItems.variation.translations',
                'shippingAddress',
                'payment.breakdowns.currency',
                'currency'
            ])
            ->latest()
            ->get();
    }

    public function getConsolidationOrders(int $fanId): Collection
    {
        return Order::where('fan_id', $fanId)
            ->where('status', Order::STATUS_ARRIVED_AT_WAREHOUSE)
            ->where(function ($query) {
                $query->whereDoesntHave('orderItems.internationalShippingItem')
                    ->orWhereHas('orderItems.internationalShippingItem.internationalShipping', function ($query) {
                        $query->where('type', InternationalShipping::TYPE_REGULAR)
                            ->whereIn('status', [10, 20]);
                    });
            })
            ->with([
                'orderItems.product.translations',
                'orderItems.product.images',
                'orderItems.variation.translations',
                'shippingAddress',
                'payment.breakdowns.currency',
                'currency'
            ])
            ->latest()
            ->get();
    }

    public function getOrganizedGroupOrderDetail(int $fanId, int $goId): GroupOrder
    {
        return GroupOrder::where('id', $goId)
            ->where('manager_id', $fanId)
            ->with([
                'creator',
                'items',
                'participants.fan.shippingAddresses' 
            ])
            ->withCount('participants')
            ->firstOrFail();
    }
}