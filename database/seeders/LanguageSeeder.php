<?php
namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['code' => 'ja', 'name' => '日本語', 'native_name' => '日本語', 'sort_order' => 1],
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'sort_order' => 2],
            ['code' => 'zh', 'name' => '繁體中文', 'native_name' => '繁體中文', 'sort_order' => 3],
            ['code' => 'fr', 'name' => 'Français', 'native_name' => 'Français', 'sort_order' => 4],
            ['code' => 'th', 'name' => 'ไทย', 'native_name' => 'ไทย', 'sort_order' => 5],
        ];

        foreach ($languages as $lang) {
            Language::updateOrCreate(['code' => $lang['code']], $lang);
        }
    }
}