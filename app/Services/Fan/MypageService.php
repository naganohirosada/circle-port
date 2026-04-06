<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\GroupOrder;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class MypageService
{

    protected $orderRepo;

    public function __construct(OrderRepositoryInterface $orderRepo)
    {
        $this->orderRepo = $orderRepo;
    }

    /**
     * それぞれのカウントを取得
     * @param int $userId
     */
    public function getPurchaseStats(int $userId): array
    {
        return [
            'ordered_count'       => $this->orderRepo->countByStatus($userId, Order::STATUS_PAID),
            'warehouse_count'     => 2,
            'shipping_count'      => 3,
            'consolidation_count' => 0, // 同梱待ちロジックは後ほど実装
        ];
    }

    /**
     * 主催したGroup Order一覧を取得
     */
    public function getOrganizedGroupOrders(int $userId): Collection
    {
        return GroupOrder::where('manager_id', $userId)
            ->with(['creator'])
            ->withCount([
                'items',
                'participants'
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
                'participants.fan.defaultAddress' 
            ])
            ->withCount('participants')
            ->firstOrFail();
    }
}