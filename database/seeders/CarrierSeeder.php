<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Carrier;

class CarrierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $carriers = ['ヤマト運輸', '佐川急便', '日本郵便', '福山通運', '西濃運輸'];
        foreach ($carriers as $name) {
            Carrier::create(['name' => $name]);
        }
    }
}