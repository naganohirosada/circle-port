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
use App\Models\TipBenefit;
use App\Models\FanUnlockedBenefit;
use Illuminate\Support\Facades\Http;

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

    /**
     * 検品仕分け完了と同時に、チップ特典デジタルアセットを解放し、
     * かつ倉庫の物理プリンターから海外ファン専用のサンクスカードを排紙する
     */
    public function processInspectionComplete(int $orderId): array
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::with(['fan', 'creator', 'shippingAddress', 'orderItems'])->findOrFail($orderId);

            // 1. 注文メモ(notes)に記録されている応援チップ額をデコード抽出
            $tipAmount = 0;
            if (!empty($order->notes)) {
                $decoded = json_decode($order->notes, true);
                $tipAmount = isset($decoded['creator_tip']) ? (int)$decoded['creator_tip'] : 0;
            }

            // 2. 【チップ特典自動解放】：チップ額が条件を満たしているデジタル特典を全自動一本釣り解放
            $eligibleBenefits = TipBenefit::where('creator_id', $order->creator_id)
                ->where('min_tip_amount', '<=', $tipAmount)
                ->get();

            foreach ($eligibleBenefits as $benefit) {
                // 重複解放の防止
                $exists = DB::table('fan_unlocked_benefits')
                    ->where('user_id', $order->user_id)
                    ->where('tip_benefit_id', $benefit->id)
                    ->exists();

                if (!$exists) {
                    DB::table('fan_unlocked_benefits')->insert([
                        'user_id'        => $order->user_id,
                        'order_id'       => $order->id,
                        'tip_benefit_id' => $benefit->id,
                        'unlocked_at'    => now(),
                        'created_at'     => now(),
                        'updated_at'     => now()
                    ]);
                }
            }

            // 3. 注文ステータスを「倉庫到着（検品中/Phase2案内前状態）」へ昇格
            $order->status = 'arrived_at_warehouse';
            $order->save();

            // 4. 【海外D2Cの真髄：オンデマンド・サンクスカードの物理自動高速印刷発火】
            $printStatus = $this->triggerWarehousePrinterServer($order, $tipAmount);

            return [
                'success'       => true,
                'unlocked_count'=> $eligibleBenefits->count(),
                'print_status'  => $printStatus
            ];
        });
    }

    /**
     * 倉庫内の物理プリンターサーバーAPI（CUPS / インテリジェントプリンター）へ印刷指示を非同期送信
     */
    private function triggerWarehousePrinterServer(Order $order, int $tipAmount): string
    {
        try {
            $fanName = $order->shippingAddress->name ?? $order->user->name ?? 'Global Fan';
            $country = $order->shippingAddress->country_code ?? 'Overseas';
            $creatorName = $order->creator->name ?? 'CirclePort Creator';

            // 倉庫プリンターのWebhookエンドポイントへ、カード印字に必要なシリアルメタデータを射出
            // 現地スタッフが手作業でカードを探す手間を100%引き算し、検品した瞬間に目の前のプリンターから自動排紙されます
            $response = Http::timeout(3)->post(config('circleport.printer_server_url', 'http://192.168.1.100/api/print'), [
                'template' => 'thanks_card_d2c',
                'order_id' => $order->id,
                'data' => [
                    'fan_name'     => $fanName,
                    'country_code' => strtoupper($country),
                    'creator_name' => $creatorName,
                    'tip_badge'    => $tipAmount >= 500 ? "⭐️ Special Supporter (¥" . number_format($tipAmount) . ")" : "Global Participant",
                    'serial_code'  => 'CP-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'printed_at'   => now()->toDateTimeString()
                ]
            ]);

            return $response->successful() ? 'printed_successfully' : 'printer_api_error';

        } catch (\Exception $e) {
            Log::warning("倉庫の物理プリンターサーバーが一時的に応答しません: " . $e->getMessage());
            return 'printer_offline_logged_to_queue';
        }
    }
}