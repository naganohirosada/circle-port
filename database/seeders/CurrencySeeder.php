<?php
namespace Database\Seeders;

use App\Models\Timezone;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * 憲法：主要ターゲット5か国 + UTC を優先的に登録
     */
    public function run(): void
    {
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'sort_order' => 1],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥', 'sort_order' => 2],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'sort_order' => 3],
            ['code' => 'TWD', 'name' => 'Taiwan Dollar', 'symbol' => 'NT$', 'sort_order' => 4],
            ['code' => 'THB', 'name' => 'Thai Baht', 'symbol' => '฿', 'sort_order' => 5],
        ];

        foreach ($currencies as $curr) {
            \App\Models\Currency::updateOrCreate(['code' => $curr['code']], $curr);
        }
    }
}