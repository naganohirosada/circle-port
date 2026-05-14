<?php

namespace Database\Seeders;

use App\Models\HsCode;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class HsCodeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. 外部キー制約を一時的に無効化
        Schema::disableForeignKeyConstraints();

        // 2. データの削除 (Truncate がエラーになる場合は delete() を使用)
        // ここでは ID をリセットするために制約無視の Truncate を実行
        DB::table('hs_codes')->truncate();

        // 3. 外部キー制約を元に戻す (インポート前でも後でも良いが、最後に必ず戻す)
        Schema::enableForeignKeyConstraints();

        // JSONファイルの読み込み
        $jsonPath = database_path('data/hs_codes.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");
            return;
        }

        $json = File::get($jsonPath);
        $data = json_decode($json, true);

        // 1000件ずつ分割してインポート
        $chunks = array_chunk($data, 1000);

        foreach ($chunks as $chunk) {
            $insertData = array_map(function ($item) {
                return [
                    'code'        => $item['code'],
                    'name_en'     => $item['name_en'],
                    'name_ja'     => $item['name_ja'] ?? null,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }, $chunk);

            DB::table('hs_codes')->insert($insertData);
        }
    }
}