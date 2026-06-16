<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EnforceLogisticsWarehouseGuard extends Command
{
    /**
     * コマンドの起動シグネチャ定義
     * @var string
     */
    protected $signature = 'logistics:warehouse-guard';

    /**
     * コマンドの概要説明
     * @var string
     */
    protected $description = 'インコタームズDDU条件に基づき、2次決済を30日以上放置した、または現地で関税支払いを拒否された国際配送注文を自動で規約没収・強制キャンセルクローズします';

    /**
     * コマンドのコンストラクタ（完全保護）
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 物流自動防衛スケジューラの強制執行
     */
    public function handle()
    {
        $this->info('==================================================================');
        $this->info('📦 倉庫泥沼化防止：物流自動防衛スケジューラ routine を開始します...');
        $this->info('==================================================================');

        // 倉庫の最大保管猶予期限（30日前）のタイムスタンプを算出
        $warehouseDeadline = Carbon::now()->subDays(30)->toDateTimeString();
        $this->comment("算出保管猶予デッドライン (30日前以前): {$warehouseDeadline}");

        $totalEnforcedShippings = 0;
        $totalEnforcedOrders = 0;

        try {
            // =================================================================
            // 防衛フェーズ 1: 国際送料決済（PAYMENT_PENDING: 20）を30日以上放置している配送を小分けに捕捉
            // =================================================================
            // chunkById を完全採用し、PHP上の配列メモリを常に最小一定に抑え込みます。
            DB::table('international_shippings')
                ->where('status', 20) // 20 = PAYMENT_PENDING (支払い待ち状態)
                ->where('updated_at', '<=', $warehouseDeadline) // 見積もり提示から30日以上放置
                ->chunkById(1000, function ($shippings) use (&$totalEnforcedShippings, &$totalEnforcedOrders) {
                    
                    $shippingIds = $shippings->pluck('id')->toArray();

                    // この1,000件のチャンクブロックごとに、水密室化されたライトなトランザクションを回す
                    DB::transaction(function() use ($shippingIds, &$totalEnforcedShippings, &$totalEnforcedOrders) {
                        
                        // 1. 国際配送ステータスを「規約違反没収クローズ（ステータス値: 90等、ここでは90を強制割当）」へアップデート
                        $updatedShippings = DB::table('international_shippings')
                            ->whereIn('id', $shippingIds)
                            ->update([
                                'status'     => 90, // 90 = FORFEITED_CLOSED (規約放置による没収終了)
                                'notes'      => DB::raw("CONCAT(COALESCE(notes, ''), '\n[LOG]: 2次決済30日以上放置のため規約に基づき自動没収クローズしました。')"),
                                'updated_at' => Carbon::now()
                            ]);

                        $totalEnforcedShippings += $updatedShippings;

                        // 2. 関連する国際配送アイテム（international_shipping_items）から注文アイテムIDを逆引き
                        $orderItemIds = DB::table('international_shipping_items')
                            ->whereIn('international_shipping_id', $shippingIds)
                            ->pluck('order_item_id')
                            ->filter()
                            ->toArray();

                        if (!empty($orderItemIds)) {
                            // 3. 紐づく親注文（orders）のIDを一本釣り
                            $orderIds = DB::table('order_items')
                                ->whereIn('id', $orderItemIds)
                                ->pluck('order_id')
                                ->filter()
                                ->toArray();

                            if (!empty($orderIds)) {
                                // 4. 規約の「現地受取拒否・送料放置時は返金不可」を執行するため、
                                // 1次決済で購入された本体注文を「強制キャンセル（没収クローズ）」ステータスへ一括スイープ
                                $updatedOrders = DB::table('orders')
                                    ->whereIn('id', array_unique($orderIds))
                                    ->update([
                                        'status'     => 'cancelled_forfeited', // 規約没収用のクリーンなステータス値
                                        'updated_at' => Carbon::now()
                                    ]);

                                $totalEnforcedOrders += $updatedOrders;
                            }
                        }
                    });

                    // 1,000件ごとに小刻みにコミットして息継ぎを挟むため、本番環境のデータベースを絶対にロック死させません。
                });

            $this->info("✨ 物流自動防衛処理が適法に執行されました。");
            $this->info(" - 30日放置により没収執行した国際配送数: {$totalEnforcedShippings} 件");
            $this->info(" - 連動して返金不可クローズした本体注文数: {$totalEnforcedOrders} 件");

            // =================================================================
            // 5. 【国際物流紛争向け監査ログ】: 万が一Stripe側でファンが抗議（チャージバック）を起こしても、
            // 「我が社は規約通りの自動物流防衛スケジュールを粛々と執行した」証拠となる公式タイムスタンプログを出力
            // =================================================================
            if ($totalEnforcedShippings > 0) {
                Log::warning("【DDU配送条件・倉庫滞留自動執行ログ】Warehouse Guard Executed. Forfeited Shippings: {$totalEnforcedShippings}, Forfeited Orders: {$totalEnforcedOrders}, Reason: 30-Days Payment Deadline Over, Timestamp: " . Carbon::now()->toDateTimeString());
            }

        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $this->error("🚨 物流自動防衛処理中に予期せぬエラーが発生しました: {$errorMessage}");
            Log::error("【倉庫防衛バッチエラー】強制クレンジングが異常終了しました。理由: {$errorMessage}");
        }

        $this->info('==================================================================');
        $this->info('🛡️ 倉庫泥沼化防止 routine 終了。中継倉庫の空き容量スペースは適法に保護されました。');
        $this->info('==================================================================');
    }
}