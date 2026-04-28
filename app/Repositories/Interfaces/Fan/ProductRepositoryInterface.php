<?php

namespace App\Repositories\Interfaces\Fan;

use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * フィルター条件に基づいて公開中の商品一覧を取得
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getFilteredProducts(array $filters, int $perPage = 20): LengthAwarePaginator;
}