<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Fan;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Models\PaymentMethod;
use App\Models\Order;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use App\Services\Common\StripeService;

class GroupOrderService
{
    protected $repository;
    protected $stripeService;
    private const GO_FEE_RATE = 0.05;

    public function __construct(
        GroupOrderRepositoryInterface $repository,
        StripeService $stripeService
    ) {
        $this->repository = $repository;
        $this->stripeService = $stripeService;
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * GOの作成ロジック
     * 鉄則：親テーブル作成後に子テーブルをループで作成する
     */
    public function createGroupOrder(array $data)
    {

        return DB::transaction(function () use ($data) {
            try {
                $data['status'] = GroupOrder::STATUS_RECRUITING; // 募集中

                // 2. 親テーブル(group_orders)の作成
                $groupOrder = $this->repository->create($data);
                // 3. 子テーブル(group_order_items)の作成
                foreach ($data['items'] as $itemData) {
                    $this->repository->createItem($groupOrder->id, $itemData);
                }
                if (!empty($data['allowed_fans'] )) {
                    foreach ($data['allowed_fans'] as $allowedFan) {
                        $this->repository->createAllowedFan($groupOrder->id, $allowedFan);
                    }
                }

                return $groupOrder;

            } catch (\Exception $e) {
                Log::error("GO作成エラー: " . $e->getMessage());
                throw $e;
            }
        });
    }

    /**
     * 招待用のファン検索ロジック
     */
    public function searchFanForInvitation(?string $uniqueId)
    {
        if (empty($uniqueId)) {
            return null;
        }
        return $this->repository->findByUniqueId($uniqueId);
    }

    public function searchPublicGroupOrders(array $filters)
    {
        // データの取得自体はRepositoryに任せる
        $results = $this->repository->searchPublic($filters);

        // 例えば「検索結果が0件なら特定のロジックを走らせる」
        // といった「ビジネス判断」をここに書く
        
        return $results;
    }

    /**
     * 検索画面用のカテゴリ一覧を取得
     */
    public function getSearchCategories(): \Illuminate\Support\Collection
    {
        return $this->repository->getCategoriesWithSub();
    }

    public function joinGroupOrder(int $goId, int $fanId, array $input)
    {
        $go = $this->repository->findById($goId);
        $fan = Fan::find($fanId);

        // 1. 期限チェック
        if ($go->recruitment_end_date && now()->isAfter($go->recruitment_end_date)) {
            throw new \Exception(__('Recruitment has ended.'));
        }

        // 2. ステータスチェック（募集中以外は参加不可）
        if ($go->status !== GroupOrder::STATUS_RECRUITING) {
            throw new \Exception(__('This project is no longer accepting participants.'));
        }

        // 3. 在庫/定員チェック
        if ($go->max_participants > 0 && $go->participants_count >= $go->max_participants) {
            throw new \Exception(__('This project has reached its maximum capacity.'));
        }

        $preparedItems = $this->prepareGoParticipantItems($input['items'], $go->id);
        $tipAmount = isset($input['tip_amount']) ? max(0, (int) round($input['tip_amount'])) : 0;
        $amounts = $this->calculateGoOrderAmounts($preparedItems, $tipAmount);

        return DB::transaction(function () use ($go, $fan, $input, $preparedItems, $amounts, $tipAmount) {
            // 1. 注文レコード作成
            $order = $this->repository->createOrder([
                'group_order_id'      => $go->id,
                'fan_id'              => $fan->id,
                'shipping_address_id' => $input['address_id'],
                'total_amount'        => $amounts['total_amount'],
                'notes'               => $tipAmount > 0 ? json_encode(['creator_tip' => $tipAmount]) : null,
                'items'               => $preparedItems,
                'payment_status'      => 'pending',
            ]);

            // 2. メインの決済手段(is_primary = 1)があるかチェック
            $primaryMethod = $fan->paymentMethods()->where('is_primary', 1)->first();

            if ($primaryMethod) {
                // --- パターン1: 保存済みカードで即決済 ---
                try {
                    $intent = $this->stripeService->chargeSavedCard($order, $primaryMethod);
                    
                    if ($intent->status === 'succeeded') {
                        $order->update(['payment_status' => 'paid']);
                        // 即時決済成功時は Order オブジェクトを返す
                        return $order;
                    }
                } catch (\Exception $e) {
                    // カードエラー等の場合はパターン2（Checkout）へ流すかエラーを投げる
                    Log::error("Immediate payment failed: " . $e->getMessage());
                }
            }

            // --- パターン2: 新規登録または保存なし ---
            $session = $this->stripeService->createEscrowAndSaveCardSession($order);
            // StripeのURL（文字列）を返す
            return $session->url;
        });
    }

    /**
     * 選択されたGOアイテムをサニタイズして価格を正規化する
     */
    private function prepareGoParticipantItems(array $submittedItems, int $goId): array
    {
        $itemIds = collect($submittedItems)
            ->pluck('id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $groupItems = GroupOrderItem::whereIn('id', $itemIds)
            ->where('group_order_id', $goId)
            ->get()
            ->keyBy('id');

        $prepared = [];

        foreach ($submittedItems as $item) {
            $selectedId = $item['id'] ?? null;
            $quantity = max(0, intval($item['quantity'] ?? 0));

            if (!$selectedId || $quantity <= 0 || !isset($groupItems[$selectedId])) {
                continue;
            }

            $groupItem = $groupItems[$selectedId];

            $prepared[] = [
                'product_id'         => $groupItem->product_id,
                'product_variant_id' => $groupItem->product_variant_id,
                'quantity'           => $quantity,
                'price'              => $groupItem->price,
            ];
        }

        if (empty($prepared)) {
            throw new \Exception(__('No valid group order items were selected.'));
        }

        return $prepared;
    }

    private function calculateGoOrderAmounts(array $items, int $tipAmount = 0): array
    {
        $goodsTotal = array_reduce($items, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
        $fee = (int) ceil($goodsTotal * self::GO_FEE_RATE);

        return [
            'goods_total'   => $goodsTotal,
            'go_fee'        => $fee,
            'tip_amount'    => $tipAmount,
            'total_amount'  => $goodsTotal + $fee + $tipAmount,
        ];
    }

    public function getPublicDetail(int $id): \App\Models\GroupOrder
    {
        return $this->repository->findPublicById($id);
    }

    /**
     * 期限切れGOのバッチ処理
     * スケジューラから毎時呼び出す想定
     */
    public function processExpiredGroupOrders()
    {
        $expiredGOs = GroupOrder::where('status', GroupOrder::STATUS_RECRUITING)
            ->where('recruitment_end_date', '<=', now())
            ->get();

        foreach ($expiredGOs as $go) {
            DB::transaction(function () use ($go) {
                // 現在の合計注文数を取得（Repository経由を推奨）
                $currentQuantity = $go->participants()->sum('quantity');

                if ($currentQuantity >= $go->min_quantity) {
                    // 【成立】ステータス更新
                    $go->update(['status' => GroupOrder::STATUS_GOAL_MET]);
                    // クリエイターへ通知
                    // $this->notifyCreator($go);
                } else {
                    // 【不成立】ステータス更新
                    $go->update(['status' => GroupOrder::STATUS_FAILED]);
                    // 全参加者に返金処理を実行
                    $this->refundParticipants($go);
                }
            });
        }
    }

    protected function refundParticipants(GroupOrder $go)
    {
        foreach ($go->participants as $participant) {
            // Stripe等の決済サービスを通じて返金
            // $this->paymentService->refund($participant->primaryOrder);
            
            // 注文ステータスをキャンセルに更新
            $participant->primaryOrder->update(['status' => 'refunded']);
        }
    }

    /**
     * 公開されている共同購入の検索
     * * @param array $filters
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function searchPublic(array $filters = [])
    {
        return $this->repository->searchPublic($filters);
    }
}