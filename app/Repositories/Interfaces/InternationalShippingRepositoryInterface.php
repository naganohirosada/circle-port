<?php

namespace App\Repositories\Interfaces;

use App\Models\InternationalShipping;
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
}