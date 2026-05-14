<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = Carbon::now();

        // 1. 言語の登録 (Indonesian)
        if (!DB::table('languages')->where('code', 'id')->exists()) {
            DB::table('languages')->insert([
                'code' => 'id',
                'name' => 'Indonesian',
                'native_name' => 'Bahasa Indonesia',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 2. 通貨の登録 (Indonesian Rupiah)
        if (!DB::table('currencies')->where('code', 'IDR')->exists()) {
            DB::table('currencies')->insert([
                'code' => 'IDR',
                'name' => 'Indonesian Rupiah',
                'symbol' => 'Rp',
                'exchange_rate' => 104.00,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 3. 国の登録 (Indonesia)
        $countryId = DB::table('countries')->insertGetId([
            'iso_code' => 'ID',
            'currency_code' => 'IDR',
            'lang_code' => 'id',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 4. 国名の多言語翻訳登録
        $translations = [
            ['locale' => 'ja', 'name' => 'インドネシア'],
            ['locale' => 'en', 'name' => 'Indonesia'],
            ['locale' => 'fr', 'name' => 'Indonésie'],
            ['locale' => 'th', 'name' => 'อินโดนีเซีย'],
            ['locale' => 'zh', 'name' => '印度尼西亚'],
            ['locale' => 'id', 'name' => 'Indonesia'],
        ];

        foreach ($translations as $trans) {
            DB::table('country_translations')->insert([
                'country_id' => $countryId,
                'locale' => $trans['locale'],
                'name' => $trans['name'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 5. タイムゾーンの登録
        // identifier, display_name, utc_offset (秒) を正しく設定します
        $timezones = [
            [
                'identifier' => 'Asia/Jakarta',
                'display_name' => '(GMT+07:00) Jakarta',
                'utc_offset' => 25200,
            ],
            [
                'identifier' => 'Asia/Makassar',
                'display_name' => '(GMT+08:00) Makassar',
                'utc_offset' => 28800,
            ],
            [
                'identifier' => 'Asia/Jayapura',
                'display_name' => '(GMT+09:00) Jayapura',
                'utc_offset' => 32400,
            ],
        ];

        foreach ($timezones as $tz) {
            // identifier カラムで重複チェックを行います
            if (!DB::table('timezones')->where('identifier', $tz['identifier'])->exists()) {
                DB::table('timezones')->insert([
                    'identifier'   => $tz['identifier'],
                    'display_name' => $tz['display_name'],
                    'utc_offset'   => $tz['utc_offset'],
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $country = DB::table('countries')->where('iso_code', 'ID')->first();
        if ($country) {
            DB::table('country_translations')->where('country_id', $country->id)->delete();
            DB::table('countries')->where('id', $country->id)->delete();
        }

        DB::table('languages')->where('code', 'id')->delete();
        DB::table('currencies')->where('code', 'IDR')->delete();
        
        $tzIdentifiers = ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'];
        DB::table('timezones')->whereIn('identifier', $tzIdentifiers)->delete();
    }
};