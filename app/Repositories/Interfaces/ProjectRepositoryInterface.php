<?php

namespace App\Repositories\Interfaces;

use App\Models\Project;

/**
 * プロジェクトデータアクセスのためのインターフェース
 * 憲法第1条：アーキテクチャの鉄則（Repository）
 */
interface ProjectRepositoryInterface
{
    /**
     * プロジェクト本体の保存・更新
     */
    public function updateOrCreate(array $data, ?int $id = null): Project;

    /**
     * プロジェクト翻訳情報の保存
     */
    public function updateTranslation(int $projectId, string $locale, array $translationData): void;

    /**
     * プロジェクトと商品の紐付け同期
     */
    public function syncProducts(int $projectId, array $productIds): void;

    /**
     * 進捗アナウンスの作成
     */
    public function createAnnouncement(array $announcementData): void;

    /**
     * IDによる取得
     */
    public function findById(int $id): Project;
}