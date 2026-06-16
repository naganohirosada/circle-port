<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GroupOrder;
use App\Models\Order;
use App\Services\Common\StripeService;
use App\Notifications\Fan\PaymentFailedNotification;
use App\Enums\PaymentStatus;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Illuminate\Support\Facades\DB;
use App\Models\Payout;

class SettleGroupOrderPayments extends Command
{
    protected $signature = 'go:settle';
    protected $description = 'GOMが承認審査し、目標達成したGOプロジェクトのホールド与信枠を一括売上確定（キャプチャ）します';

    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        parent::__construct();
        $this->stripeService = $stripeService;
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function handle()
    {
        // 1. GOMが承認し目標達成したGOプロジェクト（STATUS_GOAL_MET）を安全にロード
        $targetGOs = GroupOrder::where('status', GroupOrder::STATUS_GOAL_MET)->get();

        if ($targetGOs->isEmpty()) {
            $this->info('与信キャプチャ（売上確定）が必要なGOプロジェクトはありません。');
            return;
        }

        foreach ($targetGOs as $go) {
            $this->info("Project: [{$go->title}] の与信枠売上確定（Capture）処理を開始します...");

            // 2. このプロジェクトに紐づく、現在与信ホールド状態（AUTHORIZED_HOLD）の参加者の注文をループ
            $orders = Order::where('group_order_id', $go->id)
                ->where('payment_status', PaymentStatus::AUTHORIZED_HOLD->value)
                ->get();

            foreach ($orders as $order) {
                try {
                    // 関連するPaymentからStripeのPaymentIntent IDを安全に手繰り寄せる
                    $payment = DB::table('payments')->where('order_id', $order->id)->first();
                    $piId = $payment ? $payment->external_transaction_id : null;

                    if (!$piId || !str_starts_with($piId, 'pi_')) {
                        $this->error(" - Order ID: {$order->id} に有効なStripe与信ID（Intent ID）が見つかりません。");
                        continue;
                    }

                    // 3. 【仕様変更・大掃除】：再チャージをせず、ホールド枠を売上確定（Capture）にコンバート
                    $intent = PaymentIntent::retrieve($piId);
                    
                    if ($intent->status === 'requires_capture') {
                        $capturedIntent = $intent->capture();

                        if ($capturedIntent->status === 'succeeded') {
                            // 決済ステータスを『決済完了（SUCCEEDED）』へクリーンに更新
                            $order->update(['payment_status' => PaymentStatus::SUCCEEDED->value]);

                            // 【資金決済法対策・1】：無登録為替取引を完全回避するため、売上確定のタイムスタンプ（captured_at）を即時刻印
                            DB::table('payments')->where('order_id', $order->id)->update([
                                'status' => PaymentStatus::SUCCEEDED->value,
                                'captured_at' => now(),
                                'updated_at' => now()
                            ]);

                            // 【資金決済法対策密・2】：売上金のウォレット化（任意の引き出し機能）を絶対禁止するため、
                            // システムが統制する次回定期自動精算スケジュール（例: 翌月20日払い）へ強制コミット
                            $scheduledPayoutDate = now()->addMonths(1)->startOfMonth()->addDays(19); // 翌月20日を強制清算日に設定（180日プールルールを大幅にクリアする安全圏）

                            // 当該クリエイター向けに、その精算日のPayout（親枠）が既に存在するかチェック、なければ生成
                            $payoutId = DB::table('payouts')
                                ->where('creator_id', $go->creator_id)
                                ->where('scheduled_date', $scheduledPayoutDate->toDateString())
                                ->whereNotIn('status', [Payout::STATUS_PAID, Payout::STATUS_CANCELLED]) // すでに完了しているものは除く
                                ->value('id');

                            $netAmount = $payment->calculated_net_amount ?? round($order->total_amount * 0.92); // 手数料を引いた純手取り額

                            if (!$payoutId) {
                                $payoutId = DB::table('payouts')->insertGetId([
                                    'creator_id'     => $go->creator_id,
                                    'amount'         => $netAmount,
                                    'status'         => Payout::STATUS_PENDING, // STATUS_SCHEDULED (未処理・振込予約中)
                                    'scheduled_date' => $scheduledPayoutDate->toDateString(),
                                    'created_at'     => now(),
                                    'updated_at'     => now()
                                ]);
                            } else {
                                // 既存の定期精算枠がある場合は、今回の純利益分を合算加算
                                DB::table('payouts')->where('id', $payoutId)->increment('amount', $netAmount);
                            }

                            // 精算明細（子テーブル）に今回の決済IDを直結結合し、収納代行のエビデンスチェーンを成立させる
                            DB::table('payout_details')->insert([
                                'payout_id'  => $payoutId,
                                'payment_id' => $payment->id ?? null,
                                'amount'     => $netAmount,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                            
                            $this->line(" - Order ID: {$order->id} 与信枠の売上確定（Capture）に成功しました。");
                        }
                    } else {
                        $this->warn(" - Order ID: {$order->id} はすでに売上確定しているか、ホールド状態ではありません（Status: {$intent->status}）。");
                    }

                } catch (\Exception $e) {
                    $this->error(" - Order ID: {$order->id} 与信キャプチャ失敗: " . $e->getMessage());
                    $order->update(['payment_status' => GroupOrder::PAYMENT_STATUS_FAILED]);
                    
                    // 決済失敗時のみ、ファンにクレジットカード不備の通知を自動送信
                    if (isset($order->fan)) {
                        $order->fan->notify(new PaymentFailedNotification($order));
                    }
                }
            }

            // 4. すべての注文処理が完了したら、製造・配送フェーズ（STATUS_SHIPPING）へとプロジェクトを進める
            $go->update(['status' => GroupOrder::STATUS_SHIPPING]); 
            $this->info("Project: [{$go->title}] 与信確定バッチ処理が完了しました。\n");
        }

        $this->info('全ての与信確定（Capture）処理が終了しました。');
    }
}