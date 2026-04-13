<?php
namespace App\Services\Creator;

use App\Repositories\Interfaces\ProductionRepositoryInterface;

class ProductionService
{
    protected $productionRepo;

    public function __construct(ProductionRepositoryInterface $productionRepo)
    {
        $this->productionRepo = $productionRepo;
    }

    /**
     * 製作リスト用データの取得
     */
    public function getProductionSummary(int $creatorId, ?int $groupOrderId = null)
    {
        // 将来的に「製作済みフラグ」などを導入した場合、ここでのフィルタリングロジックを追加可能
        return $this->productionRepo->getAggregatedProductionItems($creatorId, $groupOrderId);
    }
}