<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\Fan\ProductRepositoryInterface;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Support\Facades\Auth;

class ProductService
{
    protected $repository;

    public function __construct(ProductRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * 商品一覧表示用のデータを取得・整形する
     */
    public function getProductIndexData(array $filters)
    {
        // 1. ロケールの決定
        $fan = Auth::guard('fan')->user();
        $locale = $fan && $fan->language ? $fan->language->code : 'en';

        // 2. 商品データの取得
        $products = $this->repository->getFilteredProducts($filters);

        // 3. コレクションの整形 (価格・在庫判定)
        $products->getCollection()->transform(function ($product) {
            $hasVariants = $product->variations->isNotEmpty();

            if ($hasVariants) {
                $product->display_min_price = $product->variations->min('price');
                $product->has_multiple_prices = $product->variations->min('price') != $product->variations->max('price');
                $product->total_stock = $product->variations->sum('stock_quantity');
            } else {
                $product->display_min_price = $product->price;
                $product->has_multiple_prices = false;
                $product->total_stock = $product->stock_quantity;
            }

            // デジタル作品なら常に在庫あり
            $product->is_available = ($product->product_type == 2) || ($product->total_stock > 0);

            return $product;
        });

        return [
            'products'      => $products,
            'categories'    => Category::with(['translations', 'subCategories.translations'])->get(),
            'tags'          => Tag::all(),
            'filters'       => $filters,
            'currentLocale' => $locale,
        ];
    }
}