<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WorldDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. 外部キー制約を一時的に無効化して既存データを削除
        Schema::disableForeignKeyConstraints();
        DB::table('country_translations')->truncate();
        DB::table('countries')->truncate();
        DB::table('currencies')->truncate();
        DB::table('languages')->truncate();
        Schema::enableForeignKeyConstraints();

        $now = now();

        // 2. languages (カラム: id, code, name, native_name)
        $languages = [
            ['code' => 'ja', 'name' => 'Japanese', 'native' => '日本語'],
            ['code' => 'en', 'name' => 'English', 'native' => 'English'],
            ['code' => 'zh', 'name' => 'Chinese', 'native' => '中文'],
            ['code' => 'th', 'name' => 'Thai', 'native' => 'ไทย'],
            ['code' => 'id', 'name' => 'Indonesian', 'native' => 'Bahasa Indonesia'],
            ['code' => 'vi', 'name' => 'Vietnamese', 'native' => 'Tiếng Việt'],
            ['code' => 'fr', 'name' => 'French', 'native' => 'Français'],
            ['code' => 'de', 'name' => 'German', 'native' => 'Deutsch'],
            ['code' => 'ko', 'name' => 'Korean', 'native' => '한국어'],
        ];
        foreach ($languages as $lang) {
            DB::table('languages')->insert([
                'code'        => $lang['code'],
                'name'        => $lang['name'],
                'native_name' => $lang['native'],
                'created_at'  => $now,
                'updated_at'  => $now
            ]);
        }

        // 3. currencies (カラム: id, code, symbol, name, exchange_rate)
        $currencies = [
            ['code' => 'JPY', 'symbol' => '¥', 'name' => 'Japanese Yen', 'rate' => 1.0],
            ['code' => 'USD', 'symbol' => '$', 'name' => 'US Dollar', 'rate' => 150.0],
            ['code' => 'GBP', 'symbol' => '£', 'name' => 'British Pound', 'rate' => 190.0],
            ['code' => 'EUR', 'symbol' => '€', 'name' => 'Euro', 'rate' => 160.0],
            ['code' => 'IDR', 'symbol' => 'Rp', 'name' => 'Indonesian Rupiah', 'rate' => 0.009],
            ['code' => 'THB', 'symbol' => '฿', 'name' => 'Thai Baht', 'rate' => 4.2],
            ['code' => 'VND', 'symbol' => '₫', 'name' => 'Vietnamese Dong', 'rate' => 0.006],
            ['code' => 'CNY', 'symbol' => '¥', 'name' => 'Chinese Yuan', 'rate' => 21.0],
            ['code' => 'TWD', 'symbol' => 'NT$', 'name' => 'Taiwan Dollar', 'rate' => 4.8],
            ['code' => 'HKD', 'symbol' => 'HK$', 'name' => 'Hong Kong Dollar', 'rate' => 19.5],
            ['code' => 'KRW', 'symbol' => '₩', 'name' => 'South Korean Won', 'rate' => 0.11],
            ['code' => 'AUD', 'symbol' => 'A$', 'name' => 'Australian Dollar', 'rate' => 100.0],
            ['code' => 'NZD', 'symbol' => 'NZ$', 'name' => 'New Zealand Dollar', 'rate' => 90.0],
            ['code' => 'SGD', 'symbol' => 'S$', 'name' => 'Singapore Dollar', 'rate' => 110.0],
            ['code' => 'MYR', 'symbol' => 'RM', 'name' => 'Malaysian Ringgit', 'rate' => 32.0],
        ];
        foreach ($currencies as $curr) {
            DB::table('currencies')->insert([
                'code'          => $curr['code'],
                'symbol'        => $curr['symbol'],
                'name'          => $curr['name'],
                'exchange_rate' => $curr['rate'],
                'created_at'    => $now,
                'updated_at'    => $now
            ]);
        }

        // 4. countries (カラム: id, iso_code, currency_code, lang_code)
        // 5. country_translations (カラム: id, country_id, locale, name)
        $countryList = [
            ['iso' => 'JP', 'curr' => 'JPY', 'lang' => 'ja', 'names' => ['ja' => '日本', 'en' => 'Japan']],
            ['iso' => 'US', 'curr' => 'USD', 'lang' => 'en', 'names' => ['ja' => 'アメリカ', 'en' => 'USA']],
            ['iso' => 'CA', 'curr' => 'USD', 'lang' => 'en', 'names' => ['ja' => 'カナダ', 'en' => 'Canada']],
            ['iso' => 'GB', 'curr' => 'GBP', 'lang' => 'en', 'names' => ['ja' => 'イギリス', 'en' => 'UK']],
            ['iso' => 'FR', 'curr' => 'EUR', 'lang' => 'fr', 'names' => ['ja' => 'フランス', 'en' => 'France']],
            ['iso' => 'DE', 'curr' => 'EUR', 'lang' => 'de', 'names' => ['ja' => 'ドイツ', 'en' => 'Germany']],
            ['iso' => 'ID', 'curr' => 'IDR', 'lang' => 'id', 'names' => ['ja' => 'インドネシア', 'en' => 'Indonesia']],
            ['iso' => 'TH', 'curr' => 'THB', 'lang' => 'th', 'names' => ['ja' => 'タイ', 'en' => 'Thailand']],
            ['iso' => 'VN', 'curr' => 'VND', 'lang' => 'vi', 'names' => ['ja' => 'ベトナム', 'en' => 'Vietnam']],
            ['iso' => 'CN', 'curr' => 'CNY', 'lang' => 'zh', 'names' => ['ja' => '中国', 'en' => 'China']],
            ['iso' => 'TW', 'curr' => 'TWD', 'lang' => 'zh', 'names' => ['ja' => '台湾', 'en' => 'Taiwan']],
            ['iso' => 'HK', 'curr' => 'HKD', 'lang' => 'zh', 'names' => ['ja' => '香港', 'en' => 'Hong Kong']],
            ['iso' => 'KR', 'curr' => 'KRW', 'lang' => 'ko', 'names' => ['ja' => '韓国', 'en' => 'South Korea']],
            ['iso' => 'AU', 'curr' => 'AUD', 'lang' => 'en', 'names' => ['ja' => 'オーストラリア', 'en' => 'Australia']],
            ['iso' => 'NZ', 'curr' => 'NZD', 'lang' => 'en', 'names' => ['ja' => 'ニュージーランド', 'en' => 'New Zealand']],
            ['iso' => 'SG', 'curr' => 'SGD', 'lang' => 'en', 'names' => ['ja' => 'シンガポール', 'en' => 'Singapore']],
            ['iso' => 'MY', 'curr' => 'MYR', 'lang' => 'en', 'names' => ['ja' => 'マレーシア', 'en' => 'Malaysia']],
        ];

        foreach ($countryList as $c) {
            // エラー解決：iso_code, currency_code に加え lang_code もセット
            $countryId = DB::table('countries')->insertGetId([
                'iso_code'      => $c['iso'],
                'currency_code' => $c['curr'],
                'lang_code'     => $c['lang'], // ここを追加
                'created_at'    => $now,
                'updated_at'    => $now
            ]);

            foreach ($c['names'] as $locale => $name) {
                DB::table('country_translations')->insert([
                    'country_id' => $countryId,
                    'locale'     => $locale,
                    'name'       => $name,
                    'created_at' => $now,
                    'updated_at' => $now
                ]);
            }
        }
    }
}