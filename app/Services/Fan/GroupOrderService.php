<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\GroupOrder;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Enums\GroupOrderStatus;

class GroupOrderService
{
    protected $repository;

    public function __construct(GroupOrderRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * GOの作成ロジック
     * 鉄則：親テーブル作成後に子テーブルをループで作成する
     */
    public function createGroupOrder(array $data)
    {

        return DB::transaction(function () use ($data) {
            try {
                // 1. ステータスを「公開中(1)」として設定 (憲法：数字で管理)
                $data['status'] = GroupOrder::RECRUITING; 

                // 2. 親テーブル(group_orders)の作成
                $groupOrder = $this->repository->create($data);
                // 3. 子テーブル(group_order_items)の作成
                foreach ($data['items'] as $itemData) {
                    $this->repository->createItem($groupOrder->id, $itemData);
                }
                if (!empty($data['allowed_fans'] )) {
                    foreach ($data['allowed_fans'] as $allowedFan) {
                        $this->repository->createAllowedFan($groupOrder->id, $allowedFan);
                    }
                }

                return $groupOrder;

            } catch (\Exception $e) {
                Log::error("GO作成エラー: " . $e->getMessage());
                throw $e;
            }
        });
    }

    /**
     * 招待用のファン検索ロジック
     */
    public function searchFanForInvitation(?string $uniqueId)
    {
        if (empty($uniqueId)) {
            return null;
        }
        return $this->repository->findByUniqueId($uniqueId);
    }

    public function searchPublicGroupOrders(array $filters)
    {
        // データの取得自体はRepositoryに任せる
        $results = $this->repository->searchPublic($filters);

        // 例えば「検索結果が0件なら特定のロジックを走らせる」
        // といった「ビジネス判断」をここに書く
        
        return $results;
    }

    /**
     * 検索画面用のカテゴリ一覧を取得
     */
    public function getSearchCategories(): \Illuminate\Support\Collection
    {
        return $this->repository->getCategoriesWithSub();
    }

    public function joinGroupOrder(int $goId, int $fanId, array $input)
    {
        $go = $this->repository->findPublicById($goId);

        // 1. 募集期限チェック
        if (!$go->recruitment_end_date) {
            throw new \Exception(__('The recruitment period for this project is not set.'));
        }

        if (now()->isAfter($go->recruitment_end_date)) {
            throw new \Exception(__('Recruitment has ended.'));
        }

        // 2. 定員チェック
        if ($go->max_participants > 0 && $go->participants_count >= $go->max_participants) {
            throw new \Exception(__('This project is full.'));
        }

        $mappedItems = array_map(function ($item) {
            return [
                'product_id'         => $item['product_id'],
                'product_variant_id' => $item['variant_id'] ?? null,
                'quantity'           => $item['quantity'],
                'price'              => $item['price'],
            ];
        }, $input['items']);

        // 4. 実行
        return DB::transaction(function () use ($goId, $fanId, $input, $mappedItems) {
            return $this->repository->createOrder([
                'group_order_id'      => $goId,
                'fan_id'              => $fanId,
                'shipping_address_id' => $input['address_id'],
                'total_amount'        => $input['total_amount'],
                'items'               => $mappedItems,
            ]);
        });
    }

    /**
     *
     */
    public function getPublicDetail(int $id): \App\Models\GroupOrder
    {
        return $this->repository->findPublicById($id);
    }
}