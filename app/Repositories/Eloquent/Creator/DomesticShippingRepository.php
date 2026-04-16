<?php
namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Models\DomesticShipping;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\GroupOrder;
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

    /**
     * クリエイターに関連する全ての国内配送履歴を取得
     */
    public function getByCreatorId(int $creatorId)
    {
        return DomesticShipping::where('creator_id', $creatorId)
            ->with(['warehouse', 'carrier']) // 倉庫と業者の情報も一緒に取得
            ->orderBy('created_at', 'desc')
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
            $shipping = DomesticShipping::create([
                'creator_id' => $data['creator_id'],
                'warehouse_id' => $data['warehouse_id'],
                'carrier_id' => $data['carrier_id'],
                'tracking_number' => $data['tracking_number'],
                'shipping_date' => $data['shipping_date'],
                'status' => 'shipped',
                'type' => $data['type'], // 'regular' or 'go'
            ]);

            foreach ($data['items'] as $item) {
                $shipping->items()->create([
                    'order_item_id' => $data['type'] === 'regular' ? $item['order_item_id'] : null,
                    'group_order_id' => $data['type'] === 'go' ? $item['group_order_id'] : null,
                    'quantity' => $item['quantity'],
                ]);
            }

            return $shipping;
        });
    }

    /**
     * 【新規実装】ID配列による配送データの一括取得
     * 憲法：通知や出荷指示に必要なリレーションをEagerロード
     */
    public function getByIds(array $ids)
    {
        return DomesticShipping::query()
            ->with([
                'creator',
                'warehouse',
                'items.product.translations' => fn($q) => $q->where('locale', 'ja')
            ])
            ->whereIn('id', $ids)
            ->get();
    }

    /**
     * 【新規実装】ステータスの一括更新
     * 憲法：効率的な一括アップデートを実行
     */
    public function updateStatusBulk(array $ids, int $status): void
    {
        DomesticShipping::whereIn('id', $ids)
            ->update([
                'status' => $status,
                'updated_at' => now(),
                // 出荷済みの場合は日付もセット
                'shipped_at' => $status === DomesticShipping::STATUS_SHIPPED ? now() : null
            ]);
    }

    /**
     * クリエイターの未発送の通常注文アイテムを取得
     */
    public function getPendingRegularItems(int $creatorId)
    {
        // 配送待ちの商品を持つ「注文(Order)」を取得
        return Order::where('status', Order::STATUS_PAID)
            // GO注文を除外
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('group_order_participants')
                    ->whereColumn('group_order_participants.primary_order_id', 'orders.id');
            })
            // このクリエイターの商品が含まれており、かつ未発送のものがある注文に絞る
            ->whereHas('OrderItems', function ($query) use ($creatorId) {
                $query->whereHas('product', function ($q) use ($creatorId) {
                        $q->where('creator_id', $creatorId);
                    })
                    ->whereNotExists(function ($q) {
                        $q->select(DB::raw(1))
                            ->from('domestic_shipping_items')
                            ->whereColumn('domestic_shipping_items.order_item_id', 'order_items.id');
                    });
            })
            ->with(['OrderItems' => function ($query) use ($creatorId) {
                $query->whereHas('product', function ($q) use ($creatorId) {
                    $q->where('creator_id', $creatorId);
                })->with(['product.translations', 'product.images']);
            }, 'fan'])
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'fan_name' => $order->fan->name ?? 'Unknown',
                    'order_date' => $order->created_at->format('Y-m-d'),
                    'items' => $order->OrderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product->translations->first()->name ?? 'Unknown',
                            'product_image' => $item->product->images->first()->image_url ?? null,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            });
    }

    /**
     * クリエイターの未発送のGO注文を取得
     */
    public function getPendingGoOrders(int $creatorId)
    {
        return GroupOrder::where('creator_id', $creatorId)
            ->where('status', 'completed') // 目標達成・募集終了済み
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('domestic_shipping_items')
                    ->whereColumn('domestic_shipping_items.group_order_id', 'group_orders.id');
            })
            ->with(['items.product.translations'])
            ->get();
    }
}