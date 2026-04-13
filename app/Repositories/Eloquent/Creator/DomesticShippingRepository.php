<?php
namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Models\DomesticShipping;

class DomesticShippingRepository implements DomesticShippingRepositoryInterface
{
    /**
     * 憲法：Eager Loadingによるパフォーマンス最適化
     */
    public function getShippingsByCreator(int $creatorId)
    {
        return DomesticShipping::query()
            ->where('creator_id', $creatorId)
            ->with(['items.product.translations' => function($q) {
                $q->where('locale', 'ja');
            }])
            ->orderBy('created_at', 'desc')
            ->whereNull('deleted_at') // 憲法：論理削除
            ->get();
    }

    public function findById(int $id)
    {
        return DomesticShipping::query()
            ->with(['items.product.translations', 'items.variation'])
            ->findOrFail($id);
    }
}