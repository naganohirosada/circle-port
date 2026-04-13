<?php
namespace App\Repositories\Interfaces;

interface ProductionRepositoryInterface
{
    /**
     * クリエイターの全商品の製作必要数を集計して取得
     * @param int $creatorId
     * @param int|null $groupOrderId (特定プロジェクトで絞り込む場合)
     */
    public function getAggregatedProductionItems(int $creatorId, ?int $groupOrderId = null);
}