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

    public function getDeliverableProducts(int $creatorId)
    {
        return $this->shippingRepo->getDeliverableProducts($creatorId);
    }

    public function createShipping(int $creatorId, array $items)
    {
        return $this->shippingRepo->create([
            'creator_id' => $creatorId,
            'items' => $items
        ]);
    }

    /**
     * 配送詳細の取得と権限チェック
     */
    public function getShippingDetail(int $shippingId, int $creatorId)
    {
        $shipping = $this->shippingRepo->findById($shippingId);

        // 憲法第1条：堅牢性。所有者でない場合は403
        if ($shipping->creator_id !== $creatorId) {
            abort(403, 'Unauthorized');
        }

        return $shipping;
    }

    /**
     * 発送通知処理
     */
    public function notifyShipping(
        int $shippingId,
        int $creatorId,
        array $data
    ) {
        $shipping = $this->shippingRepo->findById($shippingId);
        if ($shipping->creator_id !== $creatorId) {
            abort(403);
        }

        // 既に発送済み・受領済みの場合はエラー（二重送信防止）
        if ($shipping->status !== DomesticShipping::STATUS_PREPARING) {
            throw new \Exception('この配送プランは既に発送済みか受領済みです。');
        }

        return $shipping->update([
            'carrier_id' => $data['carrier_id'],
            'tracking_number' => $data['tracking_number'],
            'status' => DomesticShipping::STATUS_SHIPPED,
            'shipped_at' => now(),
        ]);
    }
}