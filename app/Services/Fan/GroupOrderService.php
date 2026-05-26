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
use App\Models\Currency;
use App\Enums\PaymentStatus;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use App\Services\Common\StripeService;

class GroupOrderService
{
    protected $repository;
    protected $stripeService;
    private const GO_FEE_RATE = 0.05; // GO優遇手数料率：5%

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
     */
    public function createGroupOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            try {
                $data['status'] = GroupOrder::STATUS_RECRUITING;

                $groupOrder = $this->repository->create($data);
                foreach ($data['items'] as $itemData) {
                    $this->repository->createItem($groupOrder->id, $itemData);
                }
                if (!empty($data['allowed_fans'])) {
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
     * 招待用のファン検索
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
        return $this->repository->searchPublic($filters);
    }

    /**
     * 検索画面用のカテゴリ一覧を取得
     */
    public function getSearchCategories(): \Illuminate\Support\Collection
    {
        return $this->repository->getCategoriesWithSub();
    }

    /**
     * 【5/20仕様変更】：GOM承認制に伴う仮売上ホールド（オーソリ）参加処理
     */
    public function joinGroupOrder(int $goId, int $fanId, array $input)
    {
        $go = $this->repository->findById($goId);
        $fan = Fan::find($fanId);

        $shippingAddress = \App\Models\Address::find($input['address_id']);
        if ($shippingAddress && $shippingAddress->country_code === 'JP') {
            throw new \Exception(__('Group Orders are available for international shipping only. Please use standard checkout for domestic shipping.'));
        }

        // 【新設・物理ガード】：主催者(GOM)と参加者の国コード一致チェック（同一国エリア同士で頭割りするため）
        $gom = $go->organizer;
        $gomAddress = $gom ? \App\Models\Address::find($gom->default_shipping_address_id) : null;
        if ($gomAddress && $shippingAddress && $gomAddress->country_code !== $shippingAddress->country_code) {
            throw new \Exception(__('You can only join Group Orders managed by an organizer located in your same country/region.'));
        }

        // 1. 期限チェック
        if ($go->recruitment_end_date && now()->isAfter($go->recruitment_end_date)) {
            throw new \Exception(__('Recruitment has ended.'));
        }

        // 2. ステータスチェック（募集中以外は参加不可）
        if ($go->status !== GroupOrder::STATUS_RECRUITING) {
            throw new \Exception(__('This project is no longer accepting participants.'));
        }

        // 3. 定員制限チェック
        if ($go->max_participants > 0 && $go->participants_count >= $go->max_participants) {
            throw new \Exception(__('This project has reached its maximum capacity.'));
        }

        // 4. 金額計算（中継ハンドリング費を個数ごとに累積する新生ロジック）
        $preparedItems = $this->prepareGoParticipantItems($input['items'], $go->id);
        
        // 厳格バリデーション：1サークルあたり1人3個までの購入上限チェック
        $totalRequestQty = array_sum(array_column($preparedItems, 'quantity'));
        if ($totalRequestQty > 3) {
            throw new \Exception(__('According to fan-art guidelines, you can purchase up to 3 items per Group Order.'));
        }

        $tipAmount = isset($input['tip_amount']) ? max(0, (int) round($input['tip_amount'])) : 0;
        $amounts = $this->calculateGoOrderAmounts($preparedItems, $tipAmount);

        // 5. 多通貨対応：外貨与信ホールド額の計算（フロント表示と100%完全同期）
        $currency = $fan->currency ?? Currency::where('code', 'JPY')->first();
        $baseRate = (float) ($currency->exchange_rate ?? 1.0);

        // 日本円以外の場合、5%の為替スプレッドを正確に適用
        $spread = ($currency->code === 'JPY') ? 1.0 : (1.0 + config('circleport.checkout.forex_spread_max', 0.05));
        $rate = $baseRate * $spread;
        $settlementAmount = floor($amounts['total_amount'] * $rate);

        return DB::transaction(function () use ($go, $fan, $input, $preparedItems, $amounts, $tipAmount, $currency, $rate, $settlementAmount) {
            // 注文レコード作成（※決済ステータスはステップ1で拡張した AUTHORIZED_HOLD に設定）
            $order = $this->repository->createOrder([
                'group_order_id'      => $go->id,
                'fan_id'              => $fan->id,
                'shipping_address_id' => $input['address_id'],
                'total_amount'        => $amounts['total_amount'], 
                'currency_id'         => $currency->id ?? config('circleport.default_currency_id'),
                'settlement_currency' => $currency->code,
                'settlement_rate'     => $rate,
                'settlement_amount'   => $settlementAmount,        
                'notes'               => $tipAmount > 0 ? json_encode(['creator_tip' => $tipAmount]) : null,
                'items'               => $preparedItems,
                'payment_status'      => PaymentStatus::AUTHORIZED_HOLD->value, // 『仮売上（審査待ち）』へ
            ]);

            // 【大掃除・ピボット】：即時決済を完全廃止し、Stripeの「manual capture（仮売上ホールド）」専用セッションを起動
            $session = $this->stripeService->createEscrowAndSaveCardSession($order, [
                'capture_method' => 'manual', // 与信枠のキープをStripeへ強制通知
                'metadata' => [
                    'order_type' => 'group_order_auth_hold',
                    'group_order_id' => $go->id
                ]
            ]);

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

    /**
     * 【5/20仕様変更対応】：GO専用の倉庫中継費・手数料合算ロジック
     */
    private function calculateGoOrderAmounts(array $items, int $tipAmount = 0): array
    {
        $goodsTotal = array_reduce($items, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
        
        // 購入されるグッズの「総個数（数量）」を合算
        $totalQuantity = array_reduce($items, fn($sum, $item) => $sum + $item['quantity'], 0);

        // 【仕様変更】：GO注文でも、1個あたり500円の一括配送中継ハンドリング費を加算
        $warehouseHandlingFee = $totalQuantity * 500;

        // 【仕様変更】：GO手数料（5%）のベースは「作品代金小計 ＋ 一括配送中継費」の合算値
        $baseTotalForFee = $goodsTotal + $warehouseHandlingFee;
        $fee = (int) ceil($baseTotalForFee * self::GO_FEE_RATE);

        return [
            'goods_total'            => $goodsTotal,
            'warehouse_handling_fee' => $warehouseHandlingFee,
            'go_fee'                 => $fee,
            'tip_amount'             => $tipAmount,
            'total_amount'           => $baseTotalForFee + $fee + $tipAmount,
        ];
    }

    public function getPublicDetail(int $id): \App\Models\GroupOrder
    {
        return $this->repository->findPublicById($id);
    }

    /**
     * 期限切れGOのバッチ処理
     */
    public function processExpiredGroupOrders()
    {
        $expiredGOs = GroupOrder::where('status', GroupOrder::STATUS_RECRUITING)
            ->where('recruitment_end_date', '<=', now())
            ->get();

        foreach ($expiredGOs as $go) {
            DB::transaction(function () use ($go) {
                $currentQuantity = $go->participants()->sum('quantity');

                if ($currentQuantity >= $go->min_quantity) {
                    $go->update(['status' => GroupOrder::STATUS_GOAL_MET]);
                } else {
                    $go->update(['status' => GroupOrder::STATUS_FAILED]);
                    $this->refundParticipants($go);
                }
            });
        }
    }

    protected function refundParticipants(GroupOrder $go)
    {
        foreach ($go->participants as $participant) {
            $participant->primaryOrder->update(['status' => 'refunded']);
        }
    }

    /**
     * 公開されている共同購入の検索
     */
    public function searchPublic(array $filters = [])
    {
        return $this->repository->searchPublic($filters);
    }
}