<?php

namespace App\Services\Creator;

use App\Models\Product;
use App\Services\AI\TranslationService;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Models\Country;
use Illuminate\Support\Facades\Storage;

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
     * 商品とその関連データを保存するトランザクション処理
     * @param array $data
     * @return Product
     */
    public function createProduct(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. 商品本体の保存
            $product = Product::create([
                'creator_id'      => auth()->id(),
                'category_id'     => $data['category_id'],
                'sub_category_id' => $data['sub_category_id'] ?? null, // 追加
                'hs_code_id'      => $data['has_variants'] ? null : ($data['hs_code_id'] ?? null), // 追加
                'sku'             => 'P-' . strtoupper(bin2hex(random_bytes(4))),
                'has_variants'    => $data['has_variants'],
                'price'           => $data['has_variants'] ? null : $data['price'],
                'stock_quantity'  => $data['has_variants'] ? null : $data['stock_quantity'],
                'weight_g'        => $data['has_variants'] ? null : $data['weight_g'],
                'status'          => $data['status'] ?? 1,
            ]);

            // 2. 翻訳の保存（material を含める）
            $this->saveTranslations($product, [
                'name'        => $data['name_ja'],
                'description' => $data['description_ja'],
                'material'    => $data['material_ja'] ?? null,
            ]);

            // 3. 画像の保存 (Spatie MediaLibrary)
            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $imageFile) {
                    $path = $imageFile->store('products/' . $product->id, 'public');

                    $thumbKey = $data['thumbnail_key'] ?? null;
                    $isThumbnail = ($thumbKey === "new_{$index}");

                    $product->images()->create([
                        'file_path' => $path,
                        'is_primary' => $isThumbnail,
                    ]);
                }
            }

            // 4. バリエーションの保存
            if ($data['has_variants']) {
                foreach ($data['variants'] as $vData) {
                    if (empty(array_filter($vData))) { continue; }
                    $variant = $product->variants()->create([
                        'price'          => $vData['price'],
                        'stock_quantity' => $vData['stock_quantity'],
                        'weight_g'       => $vData['weight_g'],
                        'hs_code_id'     => $vData['hs_code_id'],
                        'sku'            => 'V-' . strtoupper(bin2hex(random_bytes(4))),
                    ]);

                    $this->saveVariantTranslations($variant, [
                        'variant_name' => $vData['variant_name_ja'],
                        'material'     => $vData['material_ja'],
                    ]);
                }
            }

            return $product;
        });
    }

    /**
     * 商品翻訳の保存（全ターゲット言語をループ処理）
     * @param $product
     * @param array $content
     * @return void
     */
    private function saveTranslations($product, $content)
    {
        // 1. まずは日本語（マスター）を保存
        $product->translations()->create(array_merge($content, ['locale' => 'ja']));

        // 2. 有効な国から「日本語以外」の言語リストを取得
        $targetLocales = Country::where('status', 1)
            ->where('lang_code', '!=', 'ja')
            ->pluck('lang_code')
            ->unique();

        // 3. 各言語ごとにDeepLで翻訳して保存
        foreach ($targetLocales as $locale) {
            // DeepL API用に大文字変換 (例: en-us -> EN-US)
            $deeplTargetLang = strtoupper($locale);

            $product->translations()->create([
                'locale'      => $locale,
                'name'        => $this->translator->translate($content['name'], $deeplTargetLang),
                'description' => $this->translator->translate($content['description'], $deeplTargetLang),
                'material'    => $content['material'] ? $this->translator->translate($content['material'], $deeplTargetLang) : null,
            ]);
        }
    }

    /**
     * バリエーション翻訳の保存（こちらもループ化）
     * @param $variant
     * @param array $content
     * @return void
     */
    private function saveVariantTranslations($variant, $content)
    {
        $variant->translations()->create(array_merge($content, ['locale' => 'ja']));

        $targetLocales = Country::where('status', 1)
            ->where('lang_code', '!=', 'ja')
            ->pluck('lang_code')
            ->unique();

        foreach ($targetLocales as $locale) {
            $deeplTargetLang = strtoupper($locale);
            
            $variant->translations()->create([
                'locale'       => $locale,
                'variant_name' => $this->translator->translate($content['variant_name'], $deeplTargetLang),
                'material'     => $content['material'] ? $this->translator->translate($content['material'], $deeplTargetLang) : null,
            ]);
        }
    }

    /**
     * クリエイターの商品一覧データを取得するメソッド
     * @param int $creatorId
     * @param array $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getIndexData(int $creatorId, array $filters)
    {
        // レポジトリからページネーションデータを取得
        return $this->repository->getPaginatedForCreator($creatorId, $filters);
    }

    /**
     * 商品を更新するトランザクション処理
     * @param int $id
     * @param array $data
     * @return Product
     * 
     */
    public function updateProduct(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $product = Product::findOrFail($id);

            // 1. 本体更新
            $product->update([
                'category_id'      => $data['category_id'],
                'sub_category_id'  => $data['sub_category_id'] ?? null,
                'hs_code_id'      => $data['has_variants'] ? null : ($data['hs_code_id'] ?? null),
                'has_variants'    => $data['has_variants'],
                'price'           => $data['has_variants'] ? null : $data['price'],
                'stock_quantity'  => $data['has_variants'] ? null : $data['stock_quantity'],
                'weight_g'        => $data['has_variants'] ? null : $data['weight_g'],
                'status'          => $data['status'],
            ]);

            // 2. 翻訳更新（既存を消して再翻訳）
            $product->translations()->delete();
            $this->saveTranslations($product, [
                'name'        => $data['name_ja'],
                'description' => $data['description_ja'],
                'material'    => $data['has_variants'] ? null : ($data['material_ja'] ?? null),
            ]);

            $product->images()->update(['is_primary' => false]);

            if (str_starts_with($data['thumbnail_key'], 'uploaded_')) {
                $imageId = str_replace('uploaded_', '', $data['thumbnail_key']);
                $product->images()->where('id', $imageId)->update(['is_primary' => true]);
            }

            // 3. 画像の処理
            // 3-1. 指定された画像を削除
            if (!empty($data['delete_image_ids'])) {
                foreach ($data['delete_image_ids'] as $imageId) {
                    $img = $product->images()->find($imageId);
                    if ($img) {
                        Storage::disk('public')->delete($img->file_path);
                        $img->delete();
                    }
                }
            }
            // 3-2. 新しい画像を追加
            if (!empty($data['new_images'])) {
                foreach ($data['new_images'] as $index => $imageFile) {
                    $path = $imageFile->store('products/' . $product->id, 'public');

                    $isThumbnail = ($data['thumbnail_key'] === "new_{$index}");

                    $product->images()->create([
                        'file_path' => $path,
                        'is_primary' => $isThumbnail,
                    ]);
                }
            }

            // 4. バリエーションの更新
            if ($data['has_variants']) {
                // 一旦既存を削除して作り直す「デリート＆インサート」方式が確実
                $product->variants()->each(function($v) {
                    $v->translations()->delete();
                    $v->delete();
                });

                foreach ($data['variants'] as $vData) {
                    $variant = $product->variants()->create([
                        'price'          => $vData['price'],
                        'stock_quantity' => $vData['stock_quantity'],
                        'weight_g'       => $vData['weight_g'],
                        'hs_code_id'     => $vData['hs_code_id'],
                        'sku'            => $vData['id'] ? null : 'V-' . strtoupper(bin2hex(random_bytes(4))), // 新規なら生成
                    ]);

                    $this->saveVariantTranslations($variant, [
                        'variant_name' => $vData['variant_name_ja'],
                        'material'     => $vData['material_ja'],
                    ]);
                }
            }

            return $product;
        });
    }

    /**
     * 翻訳の更新用（既存を消して再生成、または上書き）
     */
    private function updateTranslations($product, $content)
    {
        // シンプルに既存の翻訳を一度リセットして再生成（DeepLに最新の日本語を食わせる）
        $product->translations()->delete();
        $this->saveTranslations($product, $content);
    }
    
}