<?php
namespace App\Repositories\Interfaces;

/**
 * 国内配送（クリエイター→倉庫）管理用のリポジトリインターフェース
 * 憲法第1条：アーキテクチャの鉄則
 */
interface DomesticShippingRepositoryInterface
{
    /**
     * クリエイターの配送履歴一覧を取得
     */
    public function getShippingsByCreator(int $creatorId);

    /**
     * 特定の配送詳細を取得
     */
    public function findById(int $id);

    /**
     * 配送登録用に、クリエイターが所有する配送可能な商品一覧を取得
     */
    public function getDeliverableProducts(int $creatorId);

    /**
     * 配送プランを保存（親と子の同時作成）
     */
    public function create(array $data);

    public function getByIds(array $ids);
    public function updateStatusBulk(array $ids, int $status): void;
    public function getByCreatorId(int $creatorId);
    public function getPendingRegularItems(int $creatorId);
    public function getPendingGoOrders(int $creatorId);
}