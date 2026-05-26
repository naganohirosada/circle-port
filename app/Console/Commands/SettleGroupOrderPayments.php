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
                            DB::table('payments')->where('order_id', $order->id)->update([
                                'status' => PaymentStatus::SUCCEEDED->value,
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