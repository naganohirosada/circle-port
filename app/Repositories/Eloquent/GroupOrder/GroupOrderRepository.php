<?php

namespace App\Repositories\Eloquent\GroupOrder;

use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Models\Fan;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Enums\GroupOrderStatus;

class GroupOrderRepository implements GroupOrderRepositoryInterface
{
    /**
     * GO本体の作成
     */
    public function create(array $data)
    {
        return GroupOrder::create([
            'creator_id'                    => $data['creator_id'],
            'manager_id'                    => auth()->id(),
            'title'                         => $data['title'],
            'description'                   => $data['description'],
            'recruitment_start_date'        => $data['recruitment_start_date'],
            'recruitment_end_date'          => $data['recruitment_end_date'],
            'status'                        => $data['status'], 
            'is_secondary_payment_required' => $data['is_secondary_payment_required'] ?? false,
            'shipping_mode'                 => $data['shipping_mode'],
            'is_private'                    => $data['is_private'] ?? false,
        ]);
    }

    /**
     * GOに紐づくアイテムの作成
     */
    public function createItem(int $groupOrderId, array $itemData)
    {
        return GroupOrderItem::create([
            'group_order_id' => $groupOrderId,
            'product_id' => $itemData['item_id'],
            'product_variant_id' => $itemData['variation_id'],
            'item_name'      => $itemData['item_name'],
            'price'          => $itemData['price'],
            'stock_limit'    => $itemData['stock_limit'],
        ]);
    }

    public function createAllowedFan(int $groupOrderId, array $itemData) 
    {
        return GroupOrderItem::create([
            'group_order_id' => $groupOrderId,
            'fan_id' => $itemData['fan_id'],
        ]);
    }

    /**
     * 憲法：Eager Loading（with）を活用してN+1問題を徹底排除
     */
    public function findById(int $id)
    {
        return GroupOrder::with(['items']) // 必要に応じて 'user' や 'translations' を追加
            ->whereNull('deleted_at')      // 憲法：論理削除の考慮
            ->findOrFail($id);
    }

    /**
     * 特定ユーザーのGO一覧取得
     */
    public function getByUserId(int $userId)
    {
        return GroupOrder::with(['items'])
            ->where('user_id', $userId)
            ->whereNull('deleted_at')      // 憲法：論理削除の考慮
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Unique IDでファンを1件検索（必要最低限の項目のみ）
     */
    public function findByUniqueId(string $uniqueId)
    {
        return Fan::where('unique_id', $uniqueId)
                ->select('id', 'name', 'unique_id')
                ->first();
    }
    /**
     * 公開かつ募集中のGOを検索
     */
    public function searchPublic(array $filters): LengthAwarePaginator
    {
        return GroupOrder::query()
            ->with(['creator', 'items'])
            ->withCount('participants')
            // 基本条件：非公開ではない ＆ 募集中または終了したもの（＝全公開データ）
            ->where('is_private', false)
            ->whereIn('status', [
                \App\Enums\GroupOrderStatus::RECRUITING,
                \App\Enums\GroupOrderStatus::CLOSED
            ])
            // 検索条件がある場合のみ絞り込み
            ->when($filters['name'] ?? null, function ($q, $name) {
                $q->where('title', 'like', "%{$name}%");
            })
            ->when($filters['creator'] ?? null, function ($q, $creator) {
                $q->whereHas('creator', function ($inner) use ($creator) {
                    $inner->where('name', 'like', "%{$creator}%");
                });
            })
            ->when($filters['category_id'] ?? null, function ($q, $catId) {
                $q->where('category_id', $catId);
            })
            ->latest() // 新しい順＝全表示の基本
            ->paginate(16)
            ->withQueryString();
    }

    public function getCategoriesWithSub(): \Illuminate\Support\Collection
    {
        // Categoryモデルに sub_categories リレーションがある前提です
        return \App\Models\Category::with('subCategories')
            ->with('translations') // 多言語対応
            ->get();
    }
}