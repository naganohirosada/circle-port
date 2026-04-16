<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 福岡配送センター
        Warehouse::create([
            'name'           => 'Circle Port 福岡配送センター',
            'postal_code'    => '813-0017',
            'address'        => '福岡県福岡市東区香椎照葉6-2-51 オーシャン＆フォレストタワーレジデンス 3702号室',
            'recipient_name' => 'Circle Port国内受領係',
            'phone'          => '090-8305-0981',
            'is_active'      => true,
        ]);
    }
}