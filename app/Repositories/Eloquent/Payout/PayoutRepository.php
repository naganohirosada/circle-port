<?php
namespace App\Repositories\Eloquent\Payout;

use App\Models\Payment;
use App\Models\PayoutDetail;
use App\Repositories\Interfaces\PayoutRepositoryInterface;

class PayoutRepository implements PayoutRepositoryInterface
{
    public function adjustPayoutForRefund(Payment $payment): void
    {
        $payoutDetail = PayoutDetail::where('payment_id', $payment->id)->first();
        
        if ($payoutDetail) {
            $payout = $payoutDetail->payout;
            // 未振込(10)の場合のみ金額を差し引いて明細を削除
            if ((int)$payout->status === 10) {
                $payout->decrement('amount', $payoutDetail->amount);
                $payoutDetail->delete();
            }
        }
    }
}