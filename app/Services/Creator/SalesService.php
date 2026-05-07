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

    public function getCreatorSalesSummary(int $creatorId)
    {
        $payments = $this->salesRepo->getSuccessfulPaymentsByCreator($creatorId);

        $sumItemPrice = 0;
        $sumTax = 0;
        $sumFee = 0;

        foreach ($payments as $payment) {
            // 内訳から各金額を抽出（正しいタイプを使用）
            // 1: 商品価格, 4: システム手数料, 5: 商品消費税
            $itemAmount = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_ITEM_TOTAL)->sum('amount');
            $feeAmount  = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_HANDLING_FEE)->sum('amount');
            $taxAmount  = $payment->breakdowns->where('type', PaymentBreakdown::TYPE_ITEM_TAX)->sum('amount');

            $sumItemPrice += $itemAmount;
            $sumFee       += $feeAmount;
            $sumTax       += $taxAmount;
            
            // 各決済行に「受取額（純売上）」をセット
            $payment->calculated_net_amount = $itemAmount + $taxAmount;
        }

        // 総売上 = 顧客が支払った全額（商品+税+手数料）
        $totalGross = $sumItemPrice + $sumTax + $sumFee;
        
        // 純売上 = クリエイターが受け取る額（商品+税）
        $totalNet = $sumItemPrice + $sumTax;

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