<?php
namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Models\DomesticShipping;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class DomesticShippingRepository implements DomesticShippingRepositoryInterface
{
    /**
     * 憲法：Eager Loadingによるパフォーマンス最適化
     */
   public function getShippingsByCreator(int $creatorId)
    {
        return DomesticShipping::query()
            ->where('creator_id', $creatorId)
            ->with([
                'warehouse', 
                'items.product.translations' => function($q) {
                    $q->where('locale', 'ja');
                },
                'items.variation.translations' => function($q) {
                    $q->where('locale', 'ja');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->whereNull('deleted_at') 
            ->get();
    }

    public function findById(int $id)
    {
        return DomesticShipping::query()
            ->with([
                'creator',
                'warehouse',
                'items.product.translations' => function($q) {
                    $q->where('locale', 'ja');
                },
                'items.variation.translations' => function($q) {
                    $q->where('locale', 'ja');
                }
            ])
            ->whereNull('deleted_at')
            ->findOrFail($id);
    }

    /**
     * 配送登録用の選択肢：配送可能な（クリエイターが所有する）商品一覧を取得
     * 憲法：バリエーションも含め、日本語翻訳を一括取得
     */
    public function getDeliverableProducts(int $creatorId)
    {
        return Product::query()
            ->where('creator_id', $creatorId)
            ->with([
                'translations' => fn($q) => $q->where('locale', 'ja'),
                'variations.translations' => fn($q) => $q->where('locale', 'ja')
            ])
            ->get();
    }

    /**
     * 配送プランの新規保存
     * 憲法：DBトランザクションを使用して親(Shipping)と子(Items)の整合性を担保
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 親：配送プラン作成
            $shipping = DomesticShipping::create([
                'creator_id' => $data['creator_id'],
                'warehouse_id' => $data['warehouse_id'],
                'status'     => DomesticShipping::STATUS_PREPARING,
            ]);

            // 子：配送アイテムの作成
            foreach ($data['items'] as $item) {
                $shipping->items()->create([
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['variant_id'],
                    'quantity'           => $item['quantity'],
                ]);
            }

            return $shipping;
        });
    }
}