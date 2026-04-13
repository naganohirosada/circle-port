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
}