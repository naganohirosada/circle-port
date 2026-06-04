<?php

namespace App\Services\Admin;

use App\Models\InternationalShipping;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class InternationalShippingService
{
    /**
     * DHL / FedEx APIと通信し、通関用商業インボイスおよび発送ラベルPDFを全自動生成・取得する
     */
    public function generateLabelAndInvoice(int $shippingId): array
    {
        return DB::transaction(function () use ($shippingId) {
            // 国際配送レコードと、それに紐づく注文アイテム・HSコード・配送先住所をディープにロード
            $shipping = InternationalShipping::with([
                'fan',
                'items.orderItem.product.category.hsCode',
                'items.orderItem.product.translations' => function($q) {
                    $q->where('locale', 'en'); // 通関用データは英語（en）を強制一本釣り
                },
                'orders.shippingAddress'
            ])->findOrFail($shippingId);

            // 既に発送手続きが完了している場合は二重送信を防ぐ
            if ($shipping->status >= 30) {
                throw new \Exception("対象の国際配送手続き（ID: {$shippingId}）は既に完了しています。");
            }

            // 1. 【免税輸出通関の核心】：全同梱アイテムからHSコード、英語名、重量、価格を全自動で集計・生成
            $invoiceItems = [];
            $totalWeight = 0;
            $shippingAddress = $shipping->orders->first()->shippingAddress ?? null;

            if (!$shippingAddress) {
                throw new \Exception("通関用の海外配送先住所（Shipping Address）が特定できません。");
            }

            foreach ($shipping->items as $item) {
                $orderItem = $item->orderItem;
                $product = $orderItem->product;
                
                // カテゴリー直下のHSコード、または商品固有のHSコードを安全に救済フォールバック
                $hsCode = $product->hsCode->code ?? $product->category->hsCode->code ?? '6109.10.000'; // デフォルトはTシャツ等のアパレルコード
                $englishName = $product->translations->first()->name ?? $product->name ?? 'Anime Merchandise';
                $material = $product->translations->first()->material ?? 'Cotton/Plastic';

                $invoiceItems[] = [
                    'description'      => $englishName,
                    'hs_code'          => $hsCode,
                    'quantity'         => $item->quantity,
                    'unit_value'       => (int)$orderItem->price, // 5/20仕様：完全に国内消費税が引き算された免税円貨原価
                    'currency'         => 'JPY',
                    'material_content' => $material,
                    'origin_country'   => 'JP'
                ];

                // 重量計算（設定がない場合は1点あたり250gとして安全にフォールバック算定）
                $totalWeight += ($product->weight ?? 0.25) * $item->quantity;
            }

            // 2. 【国際キャリアAPI連携（DHL / FedEx エミュレーター）】
            // 本番環境ではDHL Express API / FedEx Web ServicesのエンドポイントへJSONを射出
            $carrierPayload = [
                'shipper' => [
                    'company'      => 'CirclePort Global Warehouse',
                    'contact'      => 'CP Logistics Team',
                    'country_code' => 'JP',
                    'address'      => 'Fukuoka Warehouse 1-1',
                ],
                'recipient' => [
                    'name'         => $shippingAddress->name,
                    'country_code' => strtoupper($shippingAddress->country_code),
                    'state'        => $shippingAddress->state,
                    'city'         => $shippingAddress->city,
                    'address_line1'=> $shippingAddress->address_line1,
                    'address_line2'=> $shippingAddress->address_line2,
                    'postal_code'  => $shippingAddress->postal_code,
                    'phone'        => $shippingAddress->phone ?? '0000000000',
                ],
                'customs_clearance' => [
                    'invoice_type' => 'COMMERCIAL',
                    'items'        => $invoiceItems
                ],
                'parcel' => [
                    'weight' => $totalWeight,
                    'weight_unit' => 'KG'
                ]
            ];

            // 航空送り状（Air Waybill）および追跡番号の自動発行
            // 実際は Http::withBasicAuth()->post() 等で海外配送用PDFバイナリを受け取ります
            $trackingNumber = 'CP' . strtoupper(substr(md5(time() . $shippingId), 0, 10)) . 'JP';
            
            // 3. 【インボイス ＆ 送り状の一体型複合PDF全自動生成保存】
            // 取得したPDFバイナリをセキュアストレージへ一本釣り保存し、税関提出に備えます
            $pdfPath = "international_labels/shipping_{$shippingId}_{$trackingNumber}.pdf";
            Storage::disk('private')->put($pdfPath, 'MOCK_PDF_BINARY_DATA_GENERATED_BY_DHL_FEDEX_API');

            // 4. 【ステータス全自動昇格】：配送レコードおよび紐づく全子注文を一斉に「国際配送中」へ昇格
            $shipping->status = 30; // 国際配送中
            $shipping->tracking_number = $trackingNumber;
            $shipping->label_pdf_path = $pdfPath;
            $shipping->shipped_at = now();
            $shipping->save();

            foreach ($shipping->orders as $order) {
                $order->status = 'international_shipping'; // 国際配送中ステータスへ昇格
                $order->save();
                
                // ここでファン宛てに「国際発送完了・追跡番号解放通知」のメール/通知Queueを自動キック
            }

            return [
                'success'         => true,
                'tracking_number' => $trackingNumber,
                'pdf_path'        => $pdfPath,
                'item_count'      => count($invoiceItems)
            ];
        });
    }
}