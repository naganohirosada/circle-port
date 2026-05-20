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
use Illuminate\Support\Facades\Log;

class InspectionService
{
    public function __construct(
        protected DomesticShippingRepositoryInterface $domesticRepo,
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected OrderRepositoryInterface $orderRepo
    ) {}

    /**
     * 検品完了処理
     * @param int $domesticShippingId 国内配送ID
      * @return DomesticShipping 更新された国内配送データ
     */
    public function completeInspection(int $domesticShippingId)
    {
        return DB::transaction(function () use ($domesticShippingId) {
            // 1. 国内配送データの取得
            $shipping = DomesticShipping::with(['items.product', 'order', 'groupOrder.participants.order.items'])
                ->findOrFail($domesticShippingId);

            // 2. 国内配送を受領済みに更新
            $shipping->update([
                'status' => DomesticShippingStatus::RECEIVED,
                'received_at' => now(),
            ]);

            // 3. 配送種別（新規納品プラン or 通常注文 or GO）に応じた分岐処理
            // 3-A: 新規作品の倉庫一括納品プラン(STOCK_IN = 30)の場合
            if ((int)$shipping->shipping_type->value === \App\Enums\DomesticShippingType::STOCK_IN->value) {
                foreach ($shipping->items as $item) {

                    if ($item->product) {
                        // 倉庫で実際にカウントして受領した実数（quantity）を販売可能在庫として確実に上書き反映
                        if ($item->product_variant_id) {
                            $variant = \App\Models\ProductVariant::find($item->product_variant_id);
                            if ($variant) {
                                $variant->update(['stock_quantity' => $item->quantity]);
                            }
                        } else {
                            $item->product->update(['stock_quantity' => $item->quantity]);
                        }

                        // 商品本体のステータスを「公開中（2: STATUS_PUBLISHED）」へ自動昇格
                        $item->product->update([
                            'status'       => \App\Models\Product::STATUS_PUBLISHED,
                            'published_at' => now(),
                        ]);
                        Log::info("Product successfully published automatically via Stock-In Warehouse Inspection [Product ID: {$item->product_id}]");
                    }
                }
            } 
            // 3-B: 通常注文配送の場合
            elseif ($shipping->order_id) {
                $this->createInternationalFromRegularOrder($shipping);
            } 
            // 3-C: 海外GO共同購入の配送注文の場合
            elseif ($shipping->group_order_id) {
                $this->createInternationalFromGroupOrder($shipping);
            }

            return $shipping;
        });
    }

    /**
     * GO注文からの生成ロジック
     * @param DomesticShipping $shipping 国内配送データ（検品完了したもの）
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
     * @param $participant GO注文の参加者モデル
     * @param int $intlShippingId 紐付ける国際配送データのID（箱ID）
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
     * @param DomesticShipping $shipping 国内配送データ（検品完了したもの）
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