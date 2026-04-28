<?php
namespace App\Repositories\Interfaces;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * クリエイターの商品を検索・フィルタリングして取得
     */
    public function getPaginatedForCreator(int $creatorId, array $filters): LengthAwarePaginator;
    public function findByIdForCreator(int $id, int $creatorId): Product;
    public function store(array $data): Product;
    public function update(int $id, array $data): Product;
    public function syncTags(Product $product, array $tagIds): void;

    // 翻訳関連
    public function createTranslation(Product $product, array $data): void;
    public function deleteTranslations(Product $product): void;
    
    // 画像関連
    public function createImage(Product $product, array $data): void;
    
    // バリエーション関連
    public function createVariant(Product $product, array $data): ProductVariant;
    public function deleteVariants(Product $product): void;
    public function createVariantTranslation(ProductVariant $variant, array $data): void;
    public function findOrFail(int $id): Product;
    /**
     * フィルター条件に基づいてクリエイターの商品一覧を取得
     * * @param int $creatorId
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getFilteredProductsForCreator(int $creatorId, array $filters, int $perPage = 20): LengthAwarePaginator;
}