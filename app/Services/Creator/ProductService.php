<?php

namespace App\Services\Creator;

use App\Models\Product;
use App\Services\AI\TranslationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Repositories\Interfaces\ProductRepositoryInterface;

class ProductService
{
    protected $translator;

    public function __construct(
        TranslationService $translator,
        protected ProductRepositoryInterface $repository
    ) {
        $this->translator = $translator;
        $this->repository = $repository;
    }

    /**
     * 商品の一括登録（翻訳・画像・バリエーション含む）
     */
    public function storeProduct(array $data, int $creatorId): Product
    {
        return DB::transaction(function () use ($data, $creatorId) {
            // 1. 基本商品の作成
            $product = Product::create([
                'creator_id'     => $creatorId,
                'category_id'    => $data['category_id'],
                'has_variants'   => $data['has_variants'] ?? false,
                'price'          => $data['has_variants'] ? null : $data['price'],
                'stock_quantity' => $data['has_variants'] ? null : $data['stock_quantity'],
                'weight_g'       => $data['has_variants'] ? null : $data['weight_g'],
                'sku'            => $data['has_variants'] ? null : ($data['sku'] ?? 'P-' . Str::upper(Str::random(8))),
                'status'         => $data['status'] ?? 1,
            ]);

            // 2. 商品翻訳（JA/EN）の保存
            $this->saveProductTranslations($product, $data['name_ja'], $data['description_ja']);

            // 3. 画像の登録 (Spatie MediaLibrary)
            if (isset($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $image) {
                    $product->addMedia($image)->toMediaCollection('products');
                }
            }

            // 4. バリエーションの保存
            if ($product->has_variants && isset($data['variants'])) {
                foreach ($data['variants'] as $vData) {
                    $this->storeVariant($product, $vData);
                }
            }

            return $product;
        });
    }

    /**
     * 商品の更新
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            // 基本情報の更新
            $product->update([
                'category_id'    => $data['category_id'],
                'price'          => $product->has_variants ? null : $data['price'],
                'stock_quantity' => $product->has_variants ? null : $data['stock_quantity'],
                'weight_g'       => $product->has_variants ? null : $data['weight_g'],
                'status'         => $data['status'],
            ]);

            // 翻訳の更新（日本語が変われば英語も再翻訳）
            $this->saveProductTranslations($product, $data['name_ja'], $data['description_ja']);

            // 画像の入れ替えロジック（必要に応じて）
            // ...

            // バリエーションの同期（既存削除→新規作成 または ID指定更新）
            if ($product->has_variants && isset($data['variants'])) {
                $product->variants()->delete(); // 一旦クリアして再登録するシンプル版
                foreach ($data['variants'] as $vData) {
                    $this->storeVariant($product, $vData);
                }
            }

            return $product;
        });
    }

    /**
     * 商品の削除（関連データはマイグレーションの cascade で消えます）
     */
    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * ヘルパー：翻訳データの保存（AI翻訳実行）
     */
    private function saveProductTranslations(Product $product, string $nameJa, string $descJa): void
    {
        // 日本語
        $product->translations()->updateOrCreate(
            ['locale' => 'ja'],
            ['name' => $nameJa, 'description' => $descJa]
        );

        // AI英語翻訳 (DeepL APIを叩く)
        $enName = $this->translator->translate($nameJa, 'EN-US');
        $enDesc = $this->translator->translate($descJa, 'EN-US');

        $product->translations()->updateOrCreate(
            ['locale' => 'en'],
            ['name' => $enName, 'description' => $enDesc]
        );
    }

    /**
     * ヘルパー：バリエーションの保存
     */
    private function storeVariant(Product $product, array $vData): void
    {
        $variant = $product->variants()->create([
            'price'          => $vData['price'],
            'stock_quantity' => $vData['stock_quantity'],
            'weight_g'       => $vData['weight_g'],
            'sku'            => $vData['sku'] ?? 'V-' . Str::upper(Str::random(8)),
        ]);

        // バリエーション名（Lサイズ等）の翻訳
        $variant->translations()->create([
            'locale' => 'ja',
            'variant_name' => $vData['variant_name_ja'],
            'description' => $vData['description_ja'] ?? null,
        ]);

        $enVariantName = $this->translator->translate($vData['variant_name_ja'], 'EN-US');
        
        $variant->translations()->create([
            'locale' => 'en',
            'variant_name' => $enVariantName,
            'description' => $vData['description_en'] ?? null, // 説明は任意
        ]);
    }

    public function getIndexData(int $creatorId, array $filters)
    {
        // レポジトリからページネーションデータを取得
        return $this->repository->getPaginatedForCreator($creatorId, $filters);
    }
}