<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GroupOrder;
use App\Models\Order;
use App\Services\Common\StripeService;
use App\Notifications\Fan\PaymentFailedNotification;

class SettleGroupOrderPayments extends Command
{
    // コマンド名： php artisan go:settle
    protected $signature = 'go:settle';
    protected $description = '成立したGOプロジェクトの決済を一括実行します';

    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        parent::__construct();
        $this->stripeService = $stripeService;
    }

    public function handle()
    {
        // 1. 目標達成（成立済み）かつ、まだ決済処理が終わっていないGOを取得
        // ※ステータス値はプロジェクト内の定義に合わせて調整してください
        $targetGOs = GroupOrder::where('status', GroupOrder::STATUS_GOAL_MET)->get();

        if ($targetGOs->isEmpty()) {
            $this->info('決済が必要な成立プロジェクトはありません。');
            return;
        }

        foreach ($targetGOs as $go) {
            $this->info("Project: [{$go->title}] の決済処理を開始します...");

            // 2. そのプロジェクトに紐づく「未払い」の注文をループ
            $orders = Order::where('group_order_id', $go->id)
                ->where('payment_status', 'pending')
                ->with(['fan.paymentMethods'])
                ->get();

            foreach ($orders as $order) {
                try {
                    $primaryCard = $order->fan->paymentMethods()->where('is_primary', 1)->first();

                    if (!$primaryCard) {
                        $this->error("Fan ID: {$order->fan_id} の支払い方法が見つかりません。");
                    }

                    // 3. 決済実行
                    $intent = $this->stripeService->captureSavedCardPayment($order, $primaryCard);

                    if ($intent->status === 'succeeded') {
                        $order->update(['payment_status' => 'paid']);
                        $this->line(" - Order ID: {$order->id} 決済成功");
                    }

                } catch (\Exception $e) {
                    $this->error(" - Order ID: {$order->id} 決済失敗: " . $e->getMessage());
                    $order->update(['payment_status' => 'failed']); 
                    // 2. ファンに通知を送信
                    $order->fan->notify(new PaymentFailedNotification($order));
                    $this->error(" - Order ID: {$order->id} 通知送信完了: " . $e->getMessage());
                }
            }

            // 4. 全ての注文を処理し終えたら、プロジェクトステータスを次に進める
            // （一部失敗があっても物流は動かすためステータス更新）
            $go->update(['status' => GroupOrder::STATUS_SHIPPING]); 
            $this->info("Project: [{$go->title}] 全注文の処理が完了しました。\n");
        }

        $this->info('全てのバッチ処理が終了しました。');
    }
}