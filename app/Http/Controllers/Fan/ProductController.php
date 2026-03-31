<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Products;

class ProductController extends Controller
{
    /**
     * 商品一覧表示
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Product::with([
            'translations', 
            'images', 
            'creator', 
            'category.translations', 
            'subCategory.translations'
        ])
        ->where('status', Product::STATUS_PUBLISHED)
        ->latest();

        // 1. 作品名検索
        if ($request->name) {
            $query->whereHas('translations', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->name}%");
            });
        }

        // 2. クリエイター名検索
        if ($request->creator) {
            $query->whereHas('creator', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->creator}%");
            });
        }

        // 2. 価格検索（最小〜最大）
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // 3. カテゴリー検索
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // 4. サブカテゴリー検索
        if ($request->sub_category_id) {
            $query->where('sub_category_id', $request->sub_category_id);
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        return Inertia::render('Fan/Product/Index', [
            'products' => $query->paginate(20)->withQueryString(),
            'categories' => Category::with(['translations', 'subCategories.translations'])->get(),
            'filters' => $request->only(['name', 'creator', 'min_price', 'max_price', 'category_id', 'sub_category_id']),
        ]);
    }

    /**
     * 商品詳細表示
     * @param Product $product
     * @return \Inertia\Response
     */
    public function show(Product $product)
    {
        if ($product->status !== Product::STATUS_PUBLISHED) {
            abort(404);
        }

        $product->load([
            'translations', 
            'images', 
            'creator', 
            'category.translations', 
            'subCategory.translations',
            'variations.translations'
        ]);

        // dd($product);

        return Inertia::render('Fan/Product/Show', [
            'product' => $product,
        ]);
    }
}