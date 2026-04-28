<?php

namespace App\Repositories\Eloquent\GroupOrder;

use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Models\Fan;
use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\GroupOrderParticipant;
use Carbon\Carbon;

class GroupOrderRepository implements GroupOrderRepositoryInterface
{
    /**
     * GO本体の作成
     */
    public function create(array $data)
    {
        return GroupOrder::create([
            'creator_id'                    => $data['creator_id'],
            'manager_id'                    => auth()->id(),
            'title'                         => $data['title'],
            'description'                   => $data['description'],
            'recruitment_start_date'        => $data['recruitment_start_date'],
            'recruitment_end_date'          => $data['recruitment_end_date'],
            'status'                        => $data['status'], 
            'is_secondary_payment_required' => $data['is_secondary_payment_required'] ?? false,
            'shipping_mode'                 => $data['shipping_mode'],
            'is_private'                    => $data['is_private'] ?? false,
        ]);
    }

    /**
     * GOに紐づくアイテムの作成
     */
    public function createItem(int $groupOrderId, array $itemData)
    {
        return GroupOrderItem::create([
            'group_order_id' => $groupOrderId,
            'product_id' => $itemData['item_id'],
            'product_variant_id' => $itemData['variation_id'],
            'item_name'      => $itemData['item_name'],
            'price'          => $itemData['price'],
            'stock_limit'    => $itemData['stock_limit'],
        ]);
    }

    public function createAllowedFan(int $groupOrderId, array $itemData) 
    {
        return GroupOrderItem::create([
            'group_order_id' => $groupOrderId,
            'fan_id' => $itemData['fan_id'],
        ]);
    }

    /**
     * 憲法：Eager Loading（with）を活用してN+1問題を徹底排除
     */
    public function findById(int $id)
    {
        return GroupOrder::with(['items']) // 必要に応じて 'user' や 'translations' を追加
            ->whereNull('deleted_at')      // 憲法：論理削除の考慮
            ->findOrFail($id);
    }

    /**
     * 特定ユーザーのGO一覧取得
     */
    public function getByUserId(int $userId)
    {
        return GroupOrder::with(['items'])
            ->where('user_id', $userId)
            ->whereNull('deleted_at')      // 憲法：論理削除の考慮
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Unique IDでファンを1件検索（必要最低限の項目のみ）
     */
    public function findByUniqueId(string $uniqueId)
    {
        return Fan::where('unique_id', $uniqueId)
                ->select('id', 'name', 'unique_id')
                ->first();
    }

    /**
     * 公開かつ募集中のGOを検索
     */
    public function searchPublic(array $filters): LengthAwarePaginator
    {
        return GroupOrder::query()
            ->with(['creator', 'items'])
            ->withCount('participants')
            ->whereIn('status', [
                \App\Enums\GroupOrderStatus::RECRUITING,
                \App\Enums\GroupOrderStatus::CLOSED
            ])
            // 1. タイトル（グループ名）検索
            ->when($filters['name'] ?? null, function ($q, $name) {
                $q->where('title', 'like', "%{$name}%");
            })
            // 2. クリエイター名検索 (追加)
            ->when($filters['creator_name'] ?? null, function ($q, $creatorName) {
                $q->whereHas('creator', function($sub) use ($creatorName) {
                    $sub->where('name', 'like', "%{$creatorName}%");
                });
            })
            // 3. 2次決済の有無
            ->when($filters['is_secondary_payment_required'] ?? null, function ($q, $isSecondaryPaymentRequired) {
                $q->where('is_secondary_payment_required', $isSecondaryPaymentRequired);
            })
            // 4. 配送モード
            ->when($filters['shipping_mode'] ?? null, function ($q, $shippingMode) {
                $q->where('shipping_mode', $shippingMode);
            })
            ->latest()
            ->paginate(16)
            ->withQueryString();
    }

    public function getCategoriesWithSub(): \Illuminate\Support\Collection
    {
        // Categoryモデルに sub_categories リレーションがある前提です
        return \App\Models\Category::with('subCategories')
            ->with('translations') // 多言語対応
            ->get();
    }

    /**
     * 注文データ作成
     */
    public function createOrder(array $data): Order
    {
        // 1. まず「注文(Order)」レコードを作成する（一次決済分）
        $order = Order::create([
            'group_order_id'      => $data['group_order_id'],
            'fan_id'              => $data['fan_id'],
            'address_id' => $data['shipping_address_id'],
            'total_amount'        => $data['total_amount'],
            'status'              => Order::STATUS_PENDING, // 受付済
        ]);

        // 2. 注文明細(OrderItems)を作成
        foreach ($data['items'] as $item) {
            $order->orderItems()->create([
                'product_id'         => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'] ?? null,
                'quantity'           => $item['quantity'],
                'unit_price'         => $item['price'], // 金額
            ]);
        }

        // 3. 参加者(Participant)レコードを作成（ここで全てのカラムを埋める）
        GroupOrderParticipant::create([
            'group_order_id'         => $data['group_order_id'],
            'fan_id'                 => $data['fan_id'],
            // 一次決済（商品代）の紐付け
            'primary_order_id'       => $order->id, 
            'is_primary_paid'        => 0, // 初期値は未決済。決済完了フックで 1 に更新。
            // 二次決済（送料等）の初期化
            'secondary_order_id'     => null, // まだ発生していないので null
            'is_secondary_paid'      => 0,    // 当然 0
            'secondary_amount_share' => 0.00, // 倉庫到着後に計算されるため初期値は 0
        ]);

        return $order;
    }


    /**
     * 公開中のGOを取得
     * @param int $id
     * @return GroupOrder
     */
    public function findPublicById(int $id): GroupOrder
    {
        return GroupOrder::where('id', $id)
            ->where('is_private', false)
            ->with(['creator', 'items'])
            ->withCount('participants')
            ->firstOrFail();
    }

    public function findWithParticipantsForPayment(int $goId): GroupOrder
    {
        return GroupOrder::with(['participants.primaryOrder', 'participants.fan'])
            ->findOrFail($goId);
    }

    public function updateStatus(int $goId, array $data): bool
    {
        return GroupOrder::where('id', $goId)->update($data);
    }

    public function updateParticipantStatus(int $participantId, array $data): bool
    {
        return GroupOrderParticipant::where('id', $participantId)->update($data);
    }

    public function updateOrderStatus(int $orderId, array $data): bool
    {
        return Order::where('id', $orderId)->update($data);
    }

    public function createPayment(array $data)
    {
        return \App\Models\Payment::create($data);
    }

    public function createPaymentBreakdown(array $data)
    {
        return \App\Models\PaymentBreakdown::create($data);
    }
}