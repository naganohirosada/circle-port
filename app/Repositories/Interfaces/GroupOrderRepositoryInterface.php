<?php

namespace App\Repositories\Interfaces;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Order;
use App\Models\GroupOrder;

/**
 * 憲法：保守性とテストのしやすさを最大化するためのインターフェース
 */
interface GroupOrderRepositoryInterface
{
    /**
     * GO本体の作成
     */
    public function create(array $data);

    /**
     * GOに紐づくアイテムの作成
     */
    public function createItem(int $groupOrderId, array $itemData);

    /**
     * IDによる取得（Eager Loading含む）
     */
    public function findById(int $id);

    /**
     * 特定ユーザーのGO一覧取得
     */
    public function getByUserId(int $userId);

    /**
     * Unique IDでファンを1件検索
     */
    public function findByUniqueId(string $uniqueId);

    /**
     * 
     */
    public function createAllowedFan(int $groupOrderId, array $itemData);

    /**
     * 公開中のGroup Orderを検索（ページネーション付き）
     */
    public function searchPublic(array $filters): LengthAwarePaginator;

    /**
     * 検索フィルター用のカテゴリ（サブカテゴリ含む）を取得
     */
    public function getCategoriesWithSub(): \Illuminate\Support\Collection;

    /**
     * GO参加＆一次決済
     */
    public function createOrder(array $data): Order;

    public function findPublicById(int $id): GroupOrder;
}