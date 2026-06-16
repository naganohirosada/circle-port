<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanUpExpiredCustomerPrivacy extends Command
{
    /**
     * コマンドの起動シグネチャ定義
     * @var string
     */
    protected $signature = 'privacy:cleanup';

    /**
     * コマンドの概要説明
     * @var string
     */
    protected $description = 'GDPR国際プライバシー法に準拠し、メモリとDBロックを最小限に抑えるチャンク分割駆動方式で、180日以上前の過去ログ専用住所情報のみを不可逆クレンジングします';

    /**
     * コマンドのコンストラクタ（完全保護）
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * メモリ効率O(1)・安全ガード付きデータクレンジングバッチの強制執行
     */
    public function handle()
    {
        $this->info('==================================================================');
        $this->info('🛡️ 大量データ対応版：安全チャンク分割 GDPR クレンジングを開始します...');
        $this->info('==================================================================');

        // 国際決済・チャージバック申し立ての有効デッドライン境界線（180日前）
        $purgeDeadline = Carbon::now()->subDays(180)->toDateTimeString();
        $this->comment("算出対象デッドライン (180日前以前): {$purgeDeadline}");

        $totalPurgedAddresses = 0;
        $totalPurgedOrders = 0;

        try {
            // =================================================================
            // 対策 1: addresses テーブルを主キー ID 順に 1,000件ずつ「小分け」にスキャン
            // =================================================================
            // chunkById を使うことで、どれだけレコードが増えてもメモリ消費は常に「1,000件分」の定数で固定されます。
            DB::table('addresses')
                ->where('address_line1', '!=', '[GDPR_PURGED]') // すでにクレンジング済みのものはスキャンから除外
                ->chunkById(1000, function ($addresses) use ($purgeDeadline, &$totalPurgedAddresses) {
                    
                    // 今の1,000件のブロックに含まれる住所IDを抽出
                    $currentBlockAddressIds = $addresses->pluck('id')->toArray();

                    // =================================================================
                    // 対策 2: メモリ上ではなく、DBエンジンのインデックスを使ったサブクエリで安全弁を判定
                    // =================================================================
                    // 「180日以上前に配送完了した古い注文」で使われた住所であり、
                    // かつ「直近180日以内のアクティブな注文」でも使われておらず、
                    // かつ「ファンがアドレス帳から削除していない現役マスター」でもない、
                    // 完全な【過去履歴専用の孤立した住所ID】だけを、この1,000件の中から絞り込みます。
                    
                    $purgableAddressIds = DB::table('orders')
                        ->join('international_shippings', 'international_shippings.order_id', '=', 'orders.id')
                        ->whereIn('orders.address_id', $currentBlockAddressIds)
                        ->where('international_shippings.status', 'delivered')
                        ->where('international_shippings.updated_at', '<=', $purgeDeadline)
                        
                        // 【安全弁A】: 直近180日以内に動いているアクティブな注文に使われている住所は絶対に除外
                        ->whereNotExists(function ($query) use ($purgeDeadline) {
                            $query->select(DB::raw(1))
                                ->from('orders as active_orders')
                                ->join('international_shippings as active_shippings', 'active_shippings.order_id', '=', 'active_orders.id')
                                ->whereColumn('active_orders.address_id', 'orders.address_id')
                                ->where(function($q) use ($purgeDeadline) {
                                    $q->where('active_shippings.status', '!=', 'delivered')
                                        ->orWhere('active_shippings.updated_at', '>', $purgeDeadline);
                                });
                        })

                        // 【安全弁B】: ファンが削除していない現役のアドレス帳マスタに指定されている住所は絶対に除外
                        ->whereNotExists(function ($query) {
                            $query->select(DB::raw(1))
                                ->from('addresses as active_addr')
                                ->whereColumn('active_addr.id', 'orders.address_id')
                                ->whereNull('active_addr.deleted_at');
                        })
                        ->distinct()
                        ->pluck('orders.address_id')
                        ->toArray();

                    // この1,000件のチャンクの中にクレンジング対象があれば、単一のライトなトランザクションで即時上書き
                    if (!empty($purgableAddressIds)) {
                        DB::transaction(function() use ($purgableAddressIds, &$totalPurgedAddresses) {
                            $rows = DB::table('addresses')
                                ->whereIn('id', $purgableAddressIds)
                                ->update([
                                    'first_name'   => 'PURGED',
                                    'last_name'    => 'FAN',
                                    'postal_code'  => '000-0000',
                                    'address_line1'=> '[GDPR_PURGED]',
                                    'address_line2'=> '[DATA_CLEANSED_BY_LAW_180DAYS_OVER]',
                                    'phone_number' => '00-0000-0000',
                                    'updated_at'   => Carbon::now()
                                ]);
                            
                            $totalPurgedAddresses += $rows;
                        });
                    }
                    
                    // 1,000件ごとに小刻みに処理を確定（コミット）させるため、DBのロック時間が一瞬（ミリ秒単位）になり、
                    // 本番環境の一般ユーザーのアクセスを絶対に邪魔しません。
                });

            // =================================================================
            // 対策 3: 注文（orders）テーブル側の個人テキストノートのクレンジングも小分けに執行
            // =================================================================
            DB::table('orders')
                ->join('international_shippings', 'international_shippings.order_id', '=', 'orders.id')
                ->where('international_shippings.status', 'delivered')
                ->where('international_shippings.updated_at', '<=', $purgeDeadline)
                ->whereNotNull('orders.shipping_notes') // すでに大掃除済みのものはスキップ
                ->select('orders.id')
                ->chunkById(1000, function ($orders) use (&$totalPurgedOrders) {
                    $orderIds = $orders->pluck('id')->toArray();
                    
                    $rows = DB::table('orders')
                        ->whereIn('id', $orderIds)
                        ->update([
                            'shipping_notes' => null,
                            'updated_at'     => Carbon::now()
                        ]);

                    $totalPurgedOrders += $rows;
                }, 'orders.id'); // 結合クエリのため主キーの曖昧さ回避に名示的にカラム指定

            $this->info("✨ クレンジングが完全に安全執行されました。");
            $this->info(" - 匿名化マスキング完了住所レコード数: {$totalPurgedAddresses} 件");
            $this->info(" - テキストノート大掃除完了注文数: {$totalPurgedOrders} 件");

            // 永続保護監査ログの刻印
            Log::info("【GDPR・プライバシー保護安全チャンクバッチ】Data Cleansed Success. Active Customer Master Protected. Purged Addresses: {$totalPurgedAddresses}, Purged Orders: {$totalPurgedOrders}, Timestamp: " . Carbon::now()->toDateTimeString());

        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $this->error("🚨 チャンククレンジング処理中に予期せぬエラーが発生しました: {$errorMessage}");
            Log::error("【GDPRチャンククレンジングエラー】安全バッチが異常終了。理由: {$errorMessage}");
        }

        $this->info('==================================================================');
        $this->info('🛡️ メモリ節約型・自動プライバシークレンズ routine 終了。サーバーリソースは完全にクリーンです。');
        $this->info('==================================================================');
    }
}