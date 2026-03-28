<?php
namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * クリエイターの商品を検索・フィルタリングして取得
     */
    public function getPaginatedForCreator(int $creatorId, array $filters): LengthAwarePaginator;
	public function findByIdForCreator(int $id, int $creatorId): Product;
    public function store(array $data): Product;
}