<?php
namespace App\Services\Creator;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Models\DomesticShipping;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Notifications\ShippingCompletedNotification;

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

    public function createShipping(int $creatorId, array $data)
    {
        return $this->shippingRepo->create([
            'creator_id' => $creatorId,
            'items' => $data['items'],
            'warehouse_id' => $data['warehouse_id']
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

    /**
     * 出荷・集荷依頼の一括実行
     */
    public function ship(array $shippingIds)
    {
        return DB::transaction(function () use ($shippingIds) {
            $shippings = $this->shippingRepo->getByIds($shippingIds);
            $count = 0;

            foreach ($shippings as $shipping) {
                if ($shipping->status !== 10) continue;

                $shipping->update(['status' => 20, 'shipped_at' => now()]);

                if ($shipping->shipping_type === 'standard' && $shipping->order?->user) {
                    // 通常注文：単一の注文者に通知
                    $shipping->order->user->notify(new ShippingCompletedNotification($shipping));
                } elseif ($shipping->shipping_type === 'go' && $shipping->groupOrder) {
                    // GO注文：参加している参加者の全メイン注文に対して通知
                    foreach ($shipping->groupOrder->participants as $participant) {
                        if ($participant->order?->user) {
                            $participant->order->user->notify(new ShippingCompletedNotification($shipping));
                        }
                    }
                }
                $count++;
            }
            return $count;
        });
    }
    /**
     * 通常注文の未発送アイテムリストを取得
     */
    public function getPendingRegularOrderItems(int $creatorId)
    {
        return $this->shippingRepo->getPendingRegularItems($creatorId);
    }

    /**
     * GO注文の未発送リストを取得
     */
    public function getPendingGoOrders(int $creatorId)
    {
        return $this->shippingRepo->getPendingGoOrders($creatorId);
    }

    /**
     * 配送情報を登録
     */
    public function createDomesticShipping(array $data, int $creatorId)
    {
        try {
            $data['creator_id'] = $creatorId;
            return $this->shippingRepo->create($data);
        } catch (\Exception $e) {
            Log::error('Domestic Shipping Creation Failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * ↓ このメソッドを追加
     * コントローラーの index から呼ばれる履歴取得用
     */
    public function getCreatorShippings(int $creatorId)
    {
        return $this->shippingRepo->getByCreatorId($creatorId);
    }
}