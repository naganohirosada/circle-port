<?php
namespace Database\Seeders;

use App\Models\Timezone;
use Illuminate\Database\Seeder;

class TimezoneSeeder extends Seeder
{
    /**
     * 憲法：主要ターゲット5か国 + UTC を優先的に登録
     */
    public function run(): void
    {
        $timezones = [
            [
                'identifier'   => 'Asia/Tokyo',
                'display_name' => '(GMT+09:00) Japan Standard Time (JST)',
                'utc_offset'   => 32400,
                'sort_order'   => 10,
            ],
            [
                'identifier'   => 'Asia/Taipei',
                'display_name' => '(GMT+08:00) Taiwan Time (CST)',
                'utc_offset'   => 28800,
                'sort_order'   => 20,
            ],
            [
                'identifier'   => 'Asia/Bangkok',
                'display_name' => '(GMT+07:00) Thailand Time (ICT)',
                'utc_offset'   => 25200,
                'sort_order'   => 30,
            ],
            [
                'identifier'   => 'Europe/Paris',
                'display_name' => '(GMT+01:00) Central European Time (CET)',
                'utc_offset'   => 3600,
                'sort_order'   => 40,
            ],
            [
                'identifier'   => 'UTC',
                'display_name' => '(GMT+00:00) Coordinated Universal Time',
                'utc_offset'   => 0,
                'sort_order'   => 50,
            ],
            [
                'identifier'   => 'America/New_York',
                'display_name' => '(GMT-05:00) Eastern Time (ET)',
                'utc_offset'   => -18000,
                'sort_order'   => 60,
            ],
        ];

        foreach ($timezones as $tz) {
            // 憲法：重複登録を防ぐために updateOrCreate を使用
            Timezone::updateOrCreate(
                ['identifier' => $tz['identifier']],
                [
                    'display_name' => $tz['display_name'],
                    'utc_offset'   => $tz['utc_offset'],
                    'sort_order'   => $tz['sort_order'],
                    'status'       => 1,
                ]
            );
        }
    }
}