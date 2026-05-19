<?php
namespace App\Services\Creator;

use App\Models\PaymentBreakdown;
use App\Repositories\Interfaces\SalesRepositoryInterface;

class SalesService
{
    protected $salesRepo;
    // const PLATFORM_FEE_RATE = 0.10; // 削除：実際のbreakdownデータから計算

    public function __construct(SalesRepositoryInterface $salesRepo)
    {
        $this->salesRepo = $salesRepo;
    }

    /**
     * クリエイターの売上サマリーを取得
     *
     * @param int $creatorId
     * @return array
     */
    public function getCreatorSalesSummary(int $creatorId)
    {
        $payments = $this->salesRepo->getSuccessfulPaymentsByCreator($creatorId);

        $sumItemPrice = 0;
        $sumTax       = 0;
        $sumFee       = 0;
        $totalNet     = 0;

        foreach ($payments as $payment) {
            // 配送条件の判定のため、リレーション（注文商品と配送住所）をまとめてロード
            $payment->order->loadMissing(['orderItems.product', 'address']);
            
            $address = $payment->order->address;
            $isDomestic = $address ? ($address->country_code === 'JP') : true;
            
            $firstItem = $payment->order->orderItems->first();
            $isDirectShipping = $firstItem && $firstItem->product ? ($firstItem->product->domestic_shipping_method === 20) : false;

            // 内訳から金額コンポーネントを安全に抽出
            $itemAmount     = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_ITEM_TOTAL)->sum('amount');
            $shippingAmount = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_DOMESTIC_SHIPPING)->sum('amount');
            $feeAmount      = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_HANDLING_FEE)->sum('amount');
            $taxAmount      = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_ITEM_TAX)->sum('amount');
            $shippingTax    = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_SHIPPING_TAX)->sum('amount');

            $sumItemPrice += $itemAmount;
            $sumFee       += $feeAmount;
            $sumTax       += $taxAmount;
            
            // 3パターン配送分岐に基づき、各決済行の「受取額（純売上）」を精密にセット
            if ($isDomestic && $isDirectShipping) {
                // 自己発送は、クリエイターが受取って送料に充当するため送料分も純売上にマージ
                $netAmount = $itemAmount + $taxAmount + $shippingAmount + $shippingTax;
            } else {
                // 国際・国内一括は、商品代＋商品消費税のみが手元に残る
                $netAmount = $itemAmount + $taxAmount;
            }

            $payment->calculated_net_amount = $netAmount;
            $totalNet += $netAmount;
        }

        // 総売上 = クリエイターの手元に残る純売上高 ＋ システムに支払った手数料（プラットフォーム全体の総取扱高）
        $totalGross = $totalNet + $sumFee;

        return [
            'payments' => $payments,
            'summary' => [
                'total_gross' => (int)$totalGross,
                'total_net'   => (int)$totalNet,
                'total_fee'   => (int)$sumFee,
                'total_tax'   => (int)$sumTax,
                'count'       => $payments->count(),
            ]
        ];
    }
}