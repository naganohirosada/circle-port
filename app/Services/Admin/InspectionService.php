<?php

namespace App\Services\Admin;

use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Models\DomesticShipping;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Enums\DomesticShippingStatus;
use App\Enums\OrderStatus;

class InspectionService
{
    public function __construct(
        protected DomesticShippingRepositoryInterface $domesticRepo,
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected OrderRepositoryInterface $orderRepo
    ) {}

    /**
     * 検品完了処理
     */
    public function completeInspection(int $domesticShippingId)
    {
        return DB::transaction(function () use ($domesticShippingId) {
            // 1. 国内配送データの取得
            $shipping = DomesticShipping::with(['items', 'order', 'groupOrder.participants.order.items'])
                ->findOrFail($domesticShippingId);

            // 2. 国内配送を受領済みに更新
            $shipping->update([
                'status' => DomesticShippingStatus::RECEIVED,
                'received_at' => now(),
            ]);

            // 3. 配送タイプ（通常注文 or GO）に応じた国際配送データの作成
            if ($shipping->order_id) {
                $this->createInternationalFromRegularOrder($shipping);
            } elseif ($shipping->group_order_id) {
                $this->createInternationalFromGroupOrder($shipping);
            }

            return $shipping;
        });
    }

    /**
     * GO注文からの生成ロジック
     */
    protected function createInternationalFromGroupOrder(DomesticShipping $shipping)
    {
        // 必要なリレーション（マネージャー、参加者、注文明細）を一括ロード
        $go = $shipping->groupOrder->load(['manager', 'participants.order.items']);

        // --- A. 一括配送 (Bulk Mode) ---
        // マネージャー(manager_id)が全参加者の商品を代表して受け取るため、一つの国際配送にまとめる
        if ($go->shipping_mode === 'bulk') {
            $intlShipping = $this->intlRepo->firstOrCreatePending(
                $go->manager_id,
                ['address_id' => $go->manager->address_id ?? null] 
            );

            foreach ($go->participants as $participant) {
                $this->processParticipantItems($participant, $intlShipping->id);
            }
        } 
        
        // --- B. 個別配送 (Individual Mode) ---
        // 各参加者(fan_id)ごとに個別の国際配送データを作成し、それぞれの箱に商品を入れる
        else if ($go->shipping_mode === 'individual') {
            foreach ($go->participants as $participant) {
                // 参加者の注文に紐付く配送先住所を使用
                $intlShipping = $this->intlRepo->firstOrCreatePending(
                    $participant->fan_id,
                    ['address_id' => $participant->order?->address_id ?? null]
                );

                $this->processParticipantItems($participant, $intlShipping->id);
            }
        }
    }

    /**
     * 参加者の注文商品を在庫化し、指定の国際配送（箱）に紐付ける共通処理
     */
    protected function processParticipantItems($participant, int $intlShippingId)
    {
        if (!$participant->order) return;

        foreach ($participant->order->items as $orderItem) {
            // 1. 注文明細のステータスを「倉庫到着(3)」に更新
            $orderItem->update(['status' => \App\Enums\OrderStatus::AT_WAREHOUSE]);

            // 2. 国際配送明細（international_shipping_items）を作成
            $this->intlRepo->createItem([
                'international_shipping_id' => $intlShippingId, // 親の箱ID
                'order_item_id'           => $orderItem->id,    // どの商品の実物か
                'quantity'                => $orderItem->quantity, // 個数
            ]);
        }
    }

    /**
     * 通常注文からの生成ロジック
     */
    protected function createInternationalFromRegularOrder(DomesticShipping $shipping)
    {
        $order = $shipping->order;

        // 国際配送の「箱」を確保（なければ status=10 で新規作成）
        // address_id は注文時のものを初期値としてセット
        $intlShipping = $this->intlRepo->firstOrCreatePending(
            $order->fan_id,
            ['address_id' => $order->address_id]
        );

        foreach ($shipping->items as $dItem) {
            // 該当する商品の注文明細を取得
            $orderItem = $order->orderItems()
                ->where('product_id', $dItem->product_id)
                ->where('product_variant_id', $dItem->product_variant_id)
                ->first();

            if ($orderItem) {
                // 商品を「倉庫到着」ステータスへ
                $orderItem->update(['status' => OrderStatus::AT_WAREHOUSE]);

                // 国際配送明細（中身）の作成
                $this->intlRepo->createItem([
                    'international_shipping_id' => $intlShipping->id,
                    'order_item_id' => $orderItem->id,
                    'quantity' => $dItem->quantity,
                ]);
            }
        }

    }
}