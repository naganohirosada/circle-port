<?php
namespace App\Repositories\Eloquent\Creator;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function findOrFail(int $id): Product
    {
        return Product::findOrFail($id);
    }

    public function getAllForCreator(int $creatorId, $search = null)
    {
        $query = Product::where('creator_id', $creatorId)
            ->with(['translations' => fn($q) => $q->where('locale', 'ja')]);

        if ($search) {
            $query->whereHas('translations', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate(10);
    }

    public function findById(int $id, int $creatorId)
    {
        return Product::where('creator_id', $creatorId)
            ->with(['translations', 'variations.translations', 'media'])
            ->findOrFail($id);
    }

    public function getPaginatedForCreator(int $creatorId, array $filters): LengthAwarePaginator
    {
        $query = Product::where('creator_id', $creatorId)
            ->with([
                'translations' => fn($q) => $q->where('locale', 'ja'), // クリエイター画面は日本語固定
                'media',
                'variations' // 在庫状況確認用
            ]);

        // キーワード検索 (翻訳テーブルのnameカラムを検索)
        if (!empty($filters['search'])) {
            $query->whereHas('translations', function ($q) use ($filters) {
                $q->where('locale', 'ja')
                    ->where('name', 'like', '%' . $filters['search'] . '%');
            });
        }

        // ステータスフィルタ
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // カテゴリフィルタ
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        return $query->latest()
            ->paginate(12) // 1ページ12件（グリッド表示に最適）
            ->withQueryString();
    }

    public function findByIdForCreator(int $id, int $creatorId): Product
    {
        return Product::where('creator_id', $creatorId)
            ->with(['translations', 'variations.translations', 'media'])
            ->findOrFail($id);
    }

    public function store(array $data): Product
    {
        return Product::create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($data);
        return $product;
    }

    public function syncTags(Product $product, array $tagIds): void
    {
        $product->tags()->sync($tagIds);
    }

    public function createTranslation(Product $product, array $data): void
    {
        $product->translations()->create($data);
    }

    public function deleteTranslations(Product $product): void
    {
        $product->translations()->delete();
    }

    public function createImage(Product $product, array $data): void
    {
        $product->images()->create($data);
    }

    public function createVariant(Product $product, array $data): ProductVariant
    {
        return $product->variations()->create($data);
    }

    public function deleteVariants(Product $product): void
    {
        $product->variations->each(fn($v) => $v->translations()->delete());
        $product->variations()->delete();
    }

    public function createVariantTranslation(ProductVariant $variant, array $data): void
    {
        $variant->translations()->create($data);
    }

    /**
     * フィルター条件に基づいてクリエイターの商品一覧を取得
     */
    public function getFilteredProductsForCreator(int $creatorId, array $filters, int $perPage = 20): LengthAwarePaginator
    {
        return Product::query()
            ->where('creator_id', $creatorId)
            // キーワード検索
            ->when($filters['keyword'] ?? null, function ($query, $keyword) {
                $query->whereHas('translations', function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%");
                });
            })
            // ステータス
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            // カテゴリ
            ->when($filters['category_id'] ?? null, fn($q, $v) => $q->where('category_id', $v))
            ->when($filters['sub_category_id'] ?? null, fn($q, $v) => $q->where('sub_category_id', $v))
            // 作品形式
            ->when($filters['product_type'] ?? null, fn($q, $v) => $q->where('product_type', $v))
            // 価格範囲
            ->when($filters['price_min'] ?? null, fn($q, $v) => $q->where('price', '>=', $v))
            ->when($filters['price_max'] ?? null, fn($q, $v) => $q->where('price', '<=', $v))
            // タグ
            ->when($filters['tag_id'] ?? null, function ($query, $tagId) {
                $query->whereHas('tags', fn($q) => $q->where('tags.id', $tagId));
            })
            // 日本語翻訳だけをピンポイントで取得、または優先的にロード
            ->with(['images', 'translations' => function($query) {
                $query->where('locale', 'ja'); // これで translations には日本語しか入らなくなる
            }])
            ->with(['images', 'translations'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }
}