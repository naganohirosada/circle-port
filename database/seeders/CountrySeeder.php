<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\CountryTranslation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        // 憲法：整合性を保つため、一度クリアしてから実行
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Country::truncate();
        CountryTranslation::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $countries = [
            [
                'main' => [
                    'iso_code'      => 'JP',
                    'currency_code' => 'JPY',
                    'lang_code'     => 'ja',
                    'vat_rate'      => 0.10,
                    'status'        => 1, // 憲法：ステータスは数字管理
                ],
                'translations' => [
                    'ja' => '日本',
                    'en' => 'Japan',
                    'zh' => '日本',
                    'fr' => 'Japon',
                    'th' => 'ญี่ปุ่น',
                ]
            ],
            [
                'main' => [
                    'iso_code'      => 'TW',
                    'currency_code' => 'TWD',
                    'lang_code'     => 'zh',
                    'vat_rate'      => 0.05,
                    'status'        => 1,
                ],
                'translations' => [
                    'ja' => '台湾',
                    'en' => 'Taiwan',
                    'zh' => '台灣',
                    'fr' => 'Taïwan',
                    'th' => 'ไต้หวัน',
                ]
            ],
            [
                'main' => [
                    'iso_code'      => 'US',
                    'currency_code' => 'USD',
                    'lang_code'     => 'en-us',
                    'vat_rate'      => 0.00,
                    'status'        => 1,
                ],
                'translations' => [
                    'ja' => 'アメリカ',
                    'en' => 'United States',
                    'zh' => '美國',
                    'fr' => 'États-Unis',
                    'th' => 'สหรัฐอเมริกา',
                ]
            ],
            [
                'main' => [
                    'iso_code'      => 'FR',
                    'currency_code' => 'EUR',
                    'lang_code'     => 'fr',
                    'vat_rate'      => 0.20,
                    'status'        => 1,
                ],
                'translations' => [
                    'ja' => 'フランス',
                    'en' => 'France',
                    'zh' => '法國',
                    'fr' => 'France',
                    'th' => 'ฝรั่งเศส',
                ]
            ],
            [
                'main' => [
                    'iso_code'      => 'TH',
                    'currency_code' => 'THB',
                    'lang_code'     => 'th',
                    'vat_rate'      => 0.07,
                    'status'        => 1,
                ],
                'translations' => [
                    'ja' => 'タイ',
                    'en' => 'Thailand',
                    'zh' => '泰國',
                    'fr' => 'Thaïlande',
                    'th' => 'ไทย',
                ]
            ],
        ];

        foreach ($countries as $c) {
            // 1. メインテーブルの作成
            $country = Country::create($c['main']);

            // 2. 憲法：全ロケール分の翻訳データを作成
            foreach ($c['translations'] as $locale => $name) {
                $country->translations()->create([
                    'locale' => $locale,
                    'name'   => $name,
                ]);
            }
        }
    }
}