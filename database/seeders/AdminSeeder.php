<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存の管理者がいない場合のみ作成（重複エラー防止）
        Admin::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => '管理者',
                'password' => Hash::make('password'), // ログインパスワード: password
            ]
        );

        // 必要に応じて複数の管理者を作成する場合
        // Admin::factory(3)->create();
    }
}