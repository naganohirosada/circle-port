<?php
namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            [
                'name_ja' => '日本',
                'name_en' => 'Japan',
                'iso_code' => 'JP',
                'currency_code' => 'JPY',
                'lang_code' => 'ja',
                'vat_rate' => 0.10, // 国内消費税
                'status' => 1,
            ],
            [
                'name_ja' => '台湾',
                'name_en' => 'Taiwan',
                'iso_code' => 'TW',
                'currency_code' => 'TWD',
                'lang_code' => 'zh', // DeepLではZH（中国語）
                'vat_rate' => 0.05,
                'status' => 1,
            ],
            [
                'name_ja' => 'アメリカ',
                'name_en' => 'United States',
                'iso_code' => 'US',
                'currency_code' => 'USD',
                'lang_code' => 'en-us', // DeepLではEN-US
                'vat_rate' => 0.00, // 州によるため初期値0
                'status' => 1,
            ],
            [
                'name_ja' => 'フランス',
                'name_en' => 'France',
                'iso_code' => 'FR',
                'currency_code' => 'EUR',
                'lang_code' => 'fr',
                'vat_rate' => 0.20,
                'status' => 1,
            ],
            [
                'name_ja' => 'タイ',
                'name_en' => 'Thailand',
                'iso_code' => 'TH',
                'currency_code' => 'THB',
                'lang_code' => 'th',
                'vat_rate' => 0.07,
                'status' => 1,
            ],
        ];

        foreach ($countries as $country) {
            Country::create($country);
        }
    }
}