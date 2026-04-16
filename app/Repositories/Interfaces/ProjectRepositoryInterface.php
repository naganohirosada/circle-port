<?php

namespace App\Repositories\Interfaces;

use App\Models\ProjectAnnouncement;

/**
 * プロジェクトデータアクセスのためのインターフェース
 * 憲法第1条：アーキテクチャの鉄則（Repository）
 */
interface ProjectRepositoryInterface
{
/**
     * プロジェクトの基本情報保存・更新
     */
    public function updateOrCreate(array $data, ?int $id = null);

    /**
     * プロジェクト翻訳の保存・更新
     */
    public function updateTranslation(int $projectId, string $locale, array $data);

    /**
     * プロジェクトと商品の紐付け
     */
    public function syncProducts(int $projectId, array $productIds);

    /**
     * プロジェクトに紐づくアナウンス一覧の取得
     */
    public function getAnnouncementsByProjectId(int $projectId);

    /**
     * 【新規】アナウンス本体と画像の保存
     * * @param array $data アナウンス基本データ
     * @param array $images 画像パスの配列
     * @return ProjectAnnouncement
     */
    public function createAnnouncement(array $data, array $images = []): ProjectAnnouncement;

    /**
     * 【新規】アナウンス翻訳データの保存・更新
     * * @param int $paId アナウンスID
     * @param string $locale 言語コード
     * @param array $translationData 翻訳データ(title, content)
     */
    public function updateAnnouncementTranslation(int $paId, string $locale, array $translationData): void;
}