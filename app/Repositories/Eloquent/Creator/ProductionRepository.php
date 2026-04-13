<?php
namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\ProductionRepositoryInterface;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class ProductionRepository implements ProductionRepositoryInterface
{
    public function getAggregatedProductionItems(int $creatorId, ?int $groupOrderId = null)
    {
        $query = OrderItem::query()
            // 1. 各テーブルを結合して「名前」と「サムネイル」を取得可能にする
            ->join('products', 'order_items.product_id', '=', 'products.id')
            // 商品名の日本語翻訳を結合
            ->leftJoin('product_translations', function ($join) {
                $join->on('products.id', '=', 'product_translations.product_id')
                    ->where('product_translations.locale', '=', 'ja');
            })
            // メイン画像を結合
            ->leftJoin('product_images', function ($join) {
                $join->on('products.id', '=', 'product_images.product_id')
                    ->where('product_images.is_primary', '=', true);
            })
            // 2. フィルタリング条件
            ->where('products.creator_id', $creatorId)
            ->whereHas('order.payment', function ($q) {
                $q->where('status', Payment::STATUS_SUCCEEDED);
            });

        if ($groupOrderId) {
            $query->whereHas('order', function ($q) use ($groupOrderId) {
                $q->where('group_order_id', $groupOrderId);
            });
        }

        // 3. 取得カラムとグループ化の実行
        return $query->select(
                'order_items.product_id',
                'order_items.product_variant_id',
                'product_translations.name as product_name',      // 日本語名
                DB::raw("CONCAT('/storage/', product_images.file_path) as product_thumbnail"), // メイン画像
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->with(['variation:id,name']) // バリエーション名は今まで通りEager Load
            ->groupBy(
                'order_items.product_id', 
                'order_items.product_variant_id', 
                'product_translations.name', 
                'product_images.file_path'
            )
            ->get();
    }
}