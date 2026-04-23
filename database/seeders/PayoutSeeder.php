<?php

namespace Database\Seeders;

use App\Models\Creator;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\PayoutDetail;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PayoutSeeder extends Seeder
{
    public function run(): void
    {
        // 既存のクリエイターを取得（いなければ作成）
        $creators = Creator::all();
        if ($creators->isEmpty()) {
            $this->command->info('クリエイターが存在しないため、シーダーをスキップします。');
            return;
        }

        // 1次決済（order_idがあるもの）を取得
        $payments = Payment::whereNotNull('order_id')->limit(20)->get();
        if ($payments->isEmpty()) {
            $this->command->info('決済データが存在しないため、シーダーをスキップします。');
            return;
        }

        DB::transaction(function () use ($creators, $payments) {
            foreach ($creators as $creator) {
                // 1. 「振込済」の過去データを作成 (先月分)
                $this->createPayoutWithDetails(
                    $creator,
                    $payments->random(2),
                    Payout::STATUS_PAID,
                    Carbon::now()->subMonth()->endOfMonth(),
                    Carbon::now()->subMonth()->endOfMonth()->addDays(5) // 実際に振り込まれた日
                );

                // 2. 「未振込」の予定データを作成 (来月末予定)
                $this->createPayoutWithDetails(
                    $creator,
                    $payments->random(2),
                    Payout::STATUS_PENDING,
                    Carbon::now()->addMonth()->endOfMonth(),
                    null
                );
            }
        });
    }

    /**
     * 振込とその明細をセットで作成するヘルパー
     */
    private function createPayoutWithDetails($creator, $payments, $status, $scheduledDate, $paidAt)
    {
        // 振込レコードの作成
        $payout = Payout::create([
            'creator_id'     => $creator->id,
            'status'         => $status,
            'scheduled_date' => $scheduledDate->toDateString(),
            'paid_at'        => $paidAt,
            'amount'         => 0, // 後で更新
            'admin_notes'    => $status === Payout::STATUS_PAID ? '正常に振込完了' : '来月振込予定分',
        ]);

        $totalAmount = 0;

        foreach ($payments as $payment) {
            $amount = 2000; // テスト用の固定分配額
            
            PayoutDetail::create([
                'payout_id'  => $payout->id,
                'payment_id' => $payment->id,
                'amount'     => $amount,
            ]);

            $totalAmount += $amount;
        }

        // 合計金額を更新
        $payout->update(['amount' => $totalAmount]);
    }
}