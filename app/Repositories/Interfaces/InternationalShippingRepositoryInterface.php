<?php

namespace App\Repositories\Interfaces;

use App\Models\InternationalShipping;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface InternationalShippingRepositoryInterface
{
    /**
     * 特定ファンの未配送（pending）レコードを取得、なければ作成
     */
    public function firstOrCreatePending(int $fanId, array $defaults): InternationalShipping;

    /**
     * 配送明細（アイテム）を登録
     */
    public function createItem(array $data);

    public function paginateByStatus(array $statuses, int $perPage = 20): LengthAwarePaginator;
    public function findByIdWithDetails(int $id): InternationalShipping;
    public function update(int $id, array $data): bool;

    public function findForPayment(int $id, int $fanId): InternationalShipping;
    /**
     * 支払い完了時のステータス更新処理
     */
    public function markAsPaid(int $id): bool;

    /**
     * @return Collection<int, InternationalShipping>
     */
    public function getByFanWithTranslations(int $fanId, string $locale): Collection;

    /**
     * 梱包完了・送料確定処理（決済予約レコードの作成を含む）
     * * @param int $id
     * @param array $data
     * @return void
     */
    public function confirmPackingAndFee(int $id, array $data): void;
}