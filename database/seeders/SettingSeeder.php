<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * システム運用に必要な初期設定マスタを投入する
     */
    public function run(): void
    {
        $settings = [
            // --- 手数料関連 (fee) ---
            [
                'key' => 'system_fee_rate',
                'value' => '10',
                'group' => 'fee',
                'description' => 'システム利用料（％）: クリエイターの売上（1次決済）から差し引く手数料率'
            ],
            [
                'key' => 'stripe_fee_rate',
                'value' => '3.6',
                'group' => 'fee',
                'description' => '決済プラットフォーム手数料（％）: Stripe等の決済代行会社へ支払う料率（参考値）'
            ],

            // --- 為替レート (exchange) ---
            [
                'key' => 'usd_jpy_rate',
                'value' => '155.50',
                'group' => 'exchange',
                'description' => '米ドル/円(USD/JPY)レート: 国際配送代金等の計算に使用'
            ],
            [
                'key' => 'thb_jpy_rate',
                'value' => '4.20',
                'group' => 'exchange',
                'description' => 'タイバーツ/円(THB/JPY)レート: 海外拠点との清算等に使用'
            ],
            [
                'key' => 'eur_jpy_rate',
                'value' => '166.00', // フランス(FR)分
                'group' => 'exchange',
                'description' => 'ユーロ/円(EUR/JPY)レート: 国際配送代金等の計算に使用'
            ],
            [
                'key' => 'cny_jpy_rate',
                'value' => '21.50', // 中国(ZH)分
                'group' => 'exchange',
                'description' => '人民元/円(CNY/JPY)レート: 国際配送代金等の計算に使用'
            ],
            [
                'key' => 'exchange_buffer_rate',
                'value' => '3',
                'group' => 'exchange',
                'description' => '為替変動バッファ（％）: 請求時の為替リスクを避けるための上乗せ率'
            ],

            // --- 振込関連 (payout) ---
            [
                'key' => 'min_payout_amount',
                'value' => '5000',
                'group' => 'payout',
                'description' => '最低振込金額（円）: この金額を超えると次回の振込対象となる'
            ],
            [
                'key' => 'payout_transfer_fee',
                'value' => '250',
                'group' => 'payout',
                'description' => '振込手数料（円）: クリエイターへの振込時に差し引く実費'
            ],

            // --- 配送・物流関連 (shipping) ---
            [
                'key' => 'international_handling_fee',
                'value' => '500',
                'group' => 'shipping',
                'description' => '国際発送事務手数料（円）: 倉庫での検品・梱包・発送作業1件あたりの固定費用'
            ],
            [
                'key' => 'storage_free_days',
                'value' => '30',
                'group' => 'shipping',
                'description' => '無料保管期間（日）: 倉庫に到着してから国際発送までの無料期間'
            ],

            // --- 全般・税金 (general) ---
            [
                'key' => 'tax_rate',
                'value' => '10',
                'group' => 'general',
                'description' => '消費税率（％）: 日本国内の決済に適用される税率'
            ],
            [
                'key' => 'support_email',
                'value' => 'support@circle-port.com',
                'group' => 'general',
                'description' => 'カスタマーサポート用メールアドレス: 通知メールの返信先等に使用'
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']], // keyが重複しないように更新
                $setting
            );
        }

        $this->command->info('マスタ設定（Settings）の初期データを投入しました。');
    }
}