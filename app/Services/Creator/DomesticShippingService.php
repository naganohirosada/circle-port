<?php
namespace App\Services\Creator;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Models\DomesticShipping;

/**
 * 憲法：ビジネスロジックをServiceに集約
 */
class DomesticShippingService
{
    protected $shippingRepo;

    public function __construct(DomesticShippingRepositoryInterface $shippingRepo)
    {
        $this->shippingRepo = $shippingRepo;
    }

    /**
     * クリエイター向けの配送サマリー取得
     */
    public function getShippingList(int $creatorId)
    {
        return $this->shippingRepo->getShippingsByCreator($creatorId);
    }

    /**
     * 憲法：ステータスは数字で管理
     * 10: 準備中 (PREPARING)
     * 20: 発送済み (SHIPPED)
     * 30: 倉庫受領済み (RECEIVED)
     */
    public function updateStatus(int $shippingId, int $status)
    {
        $shipping = $this->shippingRepo->findById($shippingId);
        $shipping->status = $status;
        
        if ($status === 20) {
            $shipping->shipped_at = now();
        }

        return $shipping->save();
    }
}