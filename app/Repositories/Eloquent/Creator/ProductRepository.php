<?php
namespace App\Repositories\Eloquent\Creator;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
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
            ->with(['translations', 'variants.translations', 'media'])
            ->findOrFail($id);
    }

    public function getPaginatedForCreator(int $creatorId, array $filters): LengthAwarePaginator
    {
        $query = Product::where('creator_id', $creatorId)
            ->with([
                'translations' => fn($q) => $q->where('locale', 'ja'), // クリエイター画面は日本語固定
                'media',
                'variants' // 在庫状況確認用
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
            ->with(['translations', 'variants.translations', 'media'])
            ->findOrFail($id);
    }

    public function store(array $data): Product
    {
        return Product::create($data);
    }
}