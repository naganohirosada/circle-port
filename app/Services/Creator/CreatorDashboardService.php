<?php

namespace App\Services\Creator;

use App\Repositories\Interfaces\CreatorRepositoryInterface;

class CreatorDashboardService
{
    public function __construct(
        protected CreatorRepositoryInterface $repo
    ) {}

    public function getDashboardData(int $creatorId)
    {
        $groupOrders = $this->repo->getGroupOrders($creatorId);

        // payment_breakdown から計算された純粋な商品代金
        $pureSales = (float)$this->repo->getTotalEarnings($creatorId);

        return [
            'groupOrders'   => $groupOrders,
            'regularOrders' => $this->repo->getRecentRegularOrders($creatorId),
            'stats' => [
                'total_earnings' => $pureSales, // 商品代金の総計
                'project_count'  => $groupOrders->count(),
                'active_go'      => $groupOrders->where('status', 1)->count(),
            ]
        ];
    }
}