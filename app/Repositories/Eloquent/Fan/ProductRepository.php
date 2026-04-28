<?php

namespace App\Repositories\Eloquent\Fan;

use App\Models\Product;
use App\Repositories\Interfaces\Fan\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function getFilteredProducts(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::with([
            'translations',
            'images',
            'creator',
            'tags',
            'category.translations',
            'subCategory.translations',
            'variations.translations'
        ])
        ->where('status', Product::STATUS_PUBLISHED)
        ->latest();

        // 作品名検索
        if (!empty($filters['name'])) {
            $query->whereHas('translations', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['name']}%");
            });
        }

        // クリエイター名検索
        if (!empty($filters['creator'])) {
            $query->whereHas('creator', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['creator']}%");
            });
        }

        // カテゴリ・サブカテゴリ
        if (!empty($filters['category_id'])) $query->where('category_id', $filters['category_id']);
        if (!empty($filters['sub_category_id'])) $query->where('sub_category_id', $filters['sub_category_id']);

        // 作品形式
        if (!empty($filters['product_type'])) $query->where('product_type', $filters['product_type']);

        // 在庫状況
        if (!empty($filters['stock_status'])) {
            if ($filters['stock_status'] == 1) { // 在庫あり
                $query->where(function($q) {
                    $q->where('product_type', 2) // デジタル
                      ->orWhere(function($sub) { // 現物かつ在庫あり
                          $sub->where('product_type', 1)
                              ->where(function($stock_q) {
                                  $stock_q->where('stock_quantity', '>', 0)
                                          ->orWhereHas('variations', fn($v) => $v->where('stock_quantity', '>', 0));
                              });
                      });
                });
            } elseif ($filters['stock_status'] == 2) { // 在庫なし
                $query->where('product_type', 1)
                      ->where('stock_quantity', '<=', 0)
                      ->whereDoesntHave('variations', fn($v) => $v->where('stock_quantity', '>', 0));
            }
        }

        return $query->paginate($perPage)->withQueryString();
    }
}