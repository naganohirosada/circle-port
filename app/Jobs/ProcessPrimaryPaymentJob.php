<?php

namespace App\Jobs;

use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPrimaryPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $goId) {}

    public function handle(GroupOrderRepositoryInterface $repo): void
    {
        $go = $repo->findWithParticipantsForPayment($this->goId);
        $participants = $go->participants;
        $totalDomesticFee = $go->final_domestic_shipping_fee; // GOM画面で設定された税抜送料
        
        $count = $participants->count();
        $share = ($count > 0) ? round($totalDomesticFee / $count) : 0;

        foreach ($participants as $participant) {
            try {
                $order = $participant->primaryOrder;
                
                // --- 1. 計算ロジック ---
                
                // 商品金額合計（税抜）: order_itemsから算出
                $itemSubtotalPretax = $order->orderItems->sum(function($item) {
                    return $item->price * $item->quantity;
                });

                // 手数料（一旦非課税、あるいは税込として扱う）
                // order->total_amount は「商品代＋手数料」の税抜合計が入っている前提
                $commission = $order->total_amount - $itemSubtotalPretax;

                // 国内配送料（税抜）
                $shippingPretax = $share;

                // 税金の計算（10%）
                $itemTax = round($itemSubtotalPretax * 0.10);
                $shippingTax = round($shippingPretax * 0.10);

                // 最終決済金額（税込）
                $finalAmount = $itemSubtotalPretax + $itemTax + $commission + $shippingPretax + $shippingTax;

                // --- 2. 決済実行（Stripe等） ---
                $paymentSuccess = true; 

                if ($paymentSuccess) {
                    $payment = $repo->createPayment([
                        'order_id'           => $order->id,
                        'fan_id'             => $participant->fan_id,
                        'amount'             => $finalAmount,
                        'currency_id'        => $order->currency_id ?? 1,
                        'payment_method_id'  => $order->payment_method_id,
                        'status'             => 2,
                        'transaction_id'     => 'mock_' . uniqid(),
                    ]);

                    // --- 3. 5つの内訳を数値IDで保存 ---
                    $breakdowns = [
                        ['type' => 1, 'amount' => $itemSubtotalPretax], // TYPE_ITEM_TOTAL
                        ['type' => 5, 'amount' => $itemTax],            // TYPE_ITEM_TAX
                        ['type' => 4, 'amount' => $commission],         // TYPE_HANDLING_FEE
                        ['type' => 2, 'amount' => $shippingPretax],     // TYPE_DOMESTIC_SHIPPING
                        ['type' => 7, 'amount' => $shippingTax],        // TYPE_SHIPPING_TAX
                    ];

                    foreach ($breakdowns as $bd) {
                        $repo->createPaymentBreakdown([
                            'payment_id' => $payment->id,
                            'type'       => $bd['type'],
                            'amount'     => $bd['amount'],
                        ]);
                    }

                    // --- 4. ステータス更新 ---
                    $repo->updateParticipantStatus($participant->id, ['payment_status' => 2]);
                    $repo->updateOrderStatus($order->id, [
                        'status'       => 2,
                        'total_amount' => $finalAmount
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Payment Failed: " . $e->getMessage());
                $repo->updateParticipantStatus($participant->id, ['payment_status' => 3]);
            }
        }
        $repo->updateStatus($this->goId, ['primary_payment_status' => 3]);
    }
}