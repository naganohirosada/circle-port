<?php

namespace App\Services\Creator;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;
use App\Models\Category;
use App\Models\Tag;

class ProductService
{
    protected array $locales = ['ja', 'en', 'zh', 'th', 'fr'];

    public function __construct(
        protected ProductRepositoryInterface $repository
    ) {}

    /**
     * SKUを自動生成する (形式: CP-YYYYMMDD-連番)
     */
    private function generateSku()
    {
        $date = now()->format('Ymd');
        $prefix = "CP-{$date}-";
        
        // 今日の日付で発行されたSKUの数をカウントして連番を振る
        $todayCount = \App\Models\Product::where('sku', 'like', "{$prefix}%")->count();
        $serial = str_pad($todayCount + 1, 3, '0', STR_PAD_LEFT);
        
        return $prefix . $serial;
    }

    public function createProduct(array $data)
    {
        return DB::transaction(function () use ($data) {
            $hasVariants = !empty($data['variations']);
            $isDigital = (int)$data['product_type'] === 2;

            // 1. ファイル保存ロジック
            $digitalFilePath = null;
            if ($isDigital && !$hasVariants && isset($data['digital_file'])) {
                $digitalFilePath = $data['digital_file']->store('digital_products', 'private');
            }

            // 2. 本体保存
            $product = $this->repository->store([
                'creator_id'        => auth()->id(),
                'category_id'       => $data['category_id'],
                'sub_category_id'   => $data['sub_category_id'] ?? null,
                'product_type'      => $data['product_type'],
                'sku'               => $this->generateSku(), // 自動生成を適用
                'price'             => $hasVariants ? null : $data['price'],
                'stock_quantity'    => $isDigital ? 9999 : ($hasVariants ? null : $data['stock']),
                'weight_g'          => (!$isDigital && !$hasVariants) ? $data['weight'] : null,
                'hs_code_id'        => (!$isDigital && !$hasVariants) ? $data['hs_code_id'] : null,
                'digital_file_path' => $digitalFilePath, // 前述のロジック
                'status'            => 5,
            ]);

            // 3. 翻訳保存
            foreach ($this->locales as $locale) {
                if (!empty($data['name'][$locale])) {
                    $this->repository->createTranslation($product, [
                        'locale'      => $locale,
                        'name'        => $data['name'][$locale],
                        'description' => $data['description'][$locale] ?? '',
                        'material'    => $data['material'][$locale] ?? null,
                    ]);
                }
            }

            // 4. 画像保存
            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $image) {
                    $path = $image->store('products', 'public');
                    $this->repository->createImage($product, [
                        'file_path'  => $path,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            // 5. タグ同期
            if (!empty($data['tag_ids'])) {
                $this->repository->syncTags($product, $data['tag_ids']);
            }

            // 6. バリエーション保存
            if ($hasVariants) {
                foreach ($data['variations'] as $vData) {
                    $vDigitalPath = null;
                    if ($isDigital && isset($vData['digital_file'])) {
                        $vDigitalPath = $vData['digital_file']->store('digital_products/variants', 'private');
                    }

                    $variant = $this->repository->createVariant($product, [
                        'price'             => $vData['price'],
                        'stock_quantity'    => $isDigital ? 9999 : ($vData['stock'] ?? 0),
                        'sku'               => $product->sku . '-' . ($index + 1), // 親SKU-連番
                        'weight_g'          => !$isDigital ? ($vData['weight'] ?? null) : 0,
                        'hs_code_id'        => !$isDigital ? ($vData['hs_code_id'] ?? null) : null,
                        'digital_file_path' => $vDigitalPath,
                    ]);

                    foreach ($this->locales as $locale) {
                        if (!empty($vData['variant_name'][$locale])) {
                            $this->repository->createVariantTranslation($variant, [
                                'locale' => $locale,
                                'variant_name'   => $vData['variant_name'][$locale],
                            ]);
                        }
                    }
                }
            }

            return $product;
        });
    }

    public function updateProduct(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $product = $this->repository->findOrFail($id);
            $hasVariants = !empty($data['variations']);
            $isDigital = (int)$data['product_type'] === 2;

            // 1. デジタルファイル更新
            if ($isDigital && !$hasVariants && isset($data['digital_file'])) {
                if ($product->digital_file_path) {
                    Storage::disk('private')->delete($product->digital_file_path);
                }
                $data['digital_file_path'] = $data['digital_file']->store('digital_products', 'private');
            }

            // 2. 本体更新
            $product = $this->repository->update($id, [
                'category_id'     => $data['category_id'],
                'sub_category_id' => $data['sub_category_id'] ?? null,
                'product_type'    => $data['product_type'],
                'price'           => $hasVariants ? null : $data['price'],
                'stock'           => $isDigital ? 9999 : ($hasVariants ? null : $data['stock']),
                'weight_g'          => (!$isDigital && !$hasVariants) ? $data['weight'] : null,
                'hs_code_id'      => (!$isDigital && !$hasVariants) ? $data['hs_code_id'] : null,
                'digital_file_path' => $data['digital_file_path'] ?? $product->digital_file_path,
            ]);

            // 3. 翻訳更新
            $this->repository->deleteTranslations($product);
            foreach ($this->locales as $locale) {
                if (!empty($data['name'][$locale])) {
                    $this->repository->createTranslation($product, [
                        'locale'      => $locale,
                        'name'        => $data['name'][$locale],
                        'description' => $data['description'][$locale] ?? '',
                        'material'    => $data['material'][$locale] ?? null,
                    ]);
                }
            }

            // 4. 新規画像追加
            if (!empty($data['images'])) {
                foreach ($data['images'] as $image) {
                    $path = $image->store('products', 'public');
                    $this->repository->createImage($product, [
                        'file_path'    => $path,
                        'is_primary'   => false,
                        'sort_order'   => $product->images()->count(),
                    ]);
                }
            }

            // 5. タグ同期
            $this->repository->syncTags($product, $data['tag_ids'] ?? []);

            // 6. バリエーション更新
            $this->repository->deleteVariants($product);
            if ($hasVariants) {
                foreach ($data['variations'] as $vData) {
                    $vDigitalPath = $vData['digital_file_path'] ?? null;
                    if ($isDigital && isset($vData['digital_file'])) {
                        $vDigitalPath = $vData['digital_file']->store('digital_products/variants', 'private');
                    }

                    $variant = $this->repository->createVariant($product, [
                        'price'             => $vData['price'],
                        'stock_quantity'             => $isDigital ? 9999 : ($vData['stock'] ?? 0),
                        'sku'               => $vData['sku'] ?? 'V-' . strtoupper(Str::random(8)),
                        'weight_g'            => !$isDigital ? ($vData['weight'] ?? null) : null,
                        'hs_code_id'        => !$isDigital ? ($vData['hs_code_id'] ?? null) : null,
                        'digital_file_path' => $vDigitalPath,
                    ]);

                    foreach ($this->locales as $locale) {
                        if (!empty($vData['variant_name'][$locale])) {
                            $this->repository->createVariantTranslation($variant, [
                                'locale' => $locale,
                                'variant_name'   => $vData['variant_name'][$locale],
                            ]);
                        }
                    }
                }
            }

            return $product;
        });
    }

    /**
     * 商品を完全に削除する
     *
     * @param \App\Models\Product $product
     * @return void
     */
    public function deleteProduct($product)
    {
        // 1. 支払い待ち(例:1)や支払い済み(例:2)の注文があるか確認
        // ※ステータス値はプロジェクトの定義に合わせて調整してください
        $hasActiveOrders = $product->variants()->whereHas('orderItems.order', function ($query) {
            $query->whereIn('status', [1, 2]); // 1: 支払い待ち, 2: 支払い済み
        })->exists();

        // 本体に紐づく注文がある場合も考慮（バリエーションがない場合など）
        if (!$hasActiveOrders) {
            $hasActiveOrders = $product->orderItems()->whereHas('order', function ($query) {
                $query->whereIn('status', [1, 2]);
            })->exists();
        }

        if ($hasActiveOrders) {
            // 例外を投げてコントローラーに伝える
            throw new Exception('支払い待ち、または支払い済みの注文があるため、この作品は削除できません。');
        }

        DB::transaction(function () use ($product) {
            // --- ファイル削除ロジック（前回と同じ） ---
            foreach ($product->variants as $variant) {
                if ($variant->digital_file_path) {
                    Storage::disk('public')->delete($variant->digital_file_path);
                }
            }
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->file_path);
            }
            if ($product->digital_file_path) {
                Storage::disk('public')->delete($product->digital_file_path);
            }

            // データベースから削除
            $product->delete();
        });
    }

    /**
     * 商品一覧表示に必要なデータ一式を取得
     */
    public function getIndexData(int $creatorId, array $filters)
    {
        return [
            'products'   => $this->repository->getFilteredProductsForCreator($creatorId, $filters),
            'filters'    => $filters,
            'categories' => Category::with('subCategories')->get(),
            'tags'       => Tag::all(),
        ];
    }
}