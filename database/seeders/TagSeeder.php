<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            [
                'slug' => 'original',
                'translations' => [
                    'ja' => 'オリジナル',
                    'en' => 'Original',
                    'zh' => '原創',
                    'th' => 'ออริจินัล',
                    'fr' => 'Original',
                ]
            ],
            [
                'slug' => 'blue-archive',
                'translations' => [
                    'ja' => 'ブルーアーカイブ',
                    'en' => 'Blue Archive',
                    'zh' => '蔚藍檔案',
                    'th' => 'Blue Archive',
                    'fr' => 'Blue Archive',
                ]
            ],
            [
                'slug' => 'genshin-impact',
                'translations' => [
                    'ja' => '原神',
                    'en' => 'Genshin Impact',
                    'zh' => '原神',
                    'th' => 'Genshin Impact',
                    'fr' => 'Genshin Impact',
                ]
            ],
            [
                'slug' => 'hololive',
                'translations' => [
                    'ja' => 'ホロライブ',
                    'en' => 'Hololive',
                    'zh' => 'Hololive',
                    'th' => 'Hololive',
                    'fr' => 'Hololive',
                ]
            ],
            [
                'slug' => 'touhou-project',
                'translations' => [
                    'ja' => '東方Project',
                    'en' => 'Touhou Project',
                    'zh' => '東方Project',
                    'th' => 'Touhou Project',
                    'fr' => 'Touhou Project',
                ]
            ],
            [
                'slug' => 'fate-grand-order',
                'translations' => [
                    'ja' => 'Fate/Grand Order',
                    'en' => 'Fate/Grand Order',
                    'zh' => '命運-冠位指定',
                    'th' => 'Fate/Grand Order',
                    'fr' => 'Fate/Grand Order',
                ]
            ],
            [
                'slug' => 'uma-musume',
                'translations' => [
                    'ja' => 'ウマ娘',
                    'en' => 'Umamusume: Pretty Derby',
                    'zh' => '賽馬娘',
                    'th' => 'Umamusume',
                    'fr' => 'Umamusume',
                ]
            ],
            [
                'slug' => 'nijisanji',
                'translations' => [
                    'ja' => 'にじさんじ',
                    'en' => 'NIJISANJI',
                    'zh' => '彩虹社',
                    'th' => 'NIJISANJI',
                    'fr' => 'NIJISANJI',
                ]
            ],
            [
                'slug' => 'illustration',
                'translations' => [
                    'ja' => 'イラスト',
                    'en' => 'Illustration',
                    'zh' => '插画',
                    'th' => 'ภาพประกอบ',
                    'fr' => 'Illustration',
                ]
            ],
            [
                'slug' => '3d-model',
                'translations' => [
                    'ja' => '3Dモデル',
                    'en' => '3D Model',
                    'zh' => '3D模型',
                    'th' => 'โมเดล 3D',
                    'fr' => 'Modèle 3D',
                ]
            ],
        ];

        foreach ($tags as $tagData) {
            // 1. Tag本体の作成
            $tag = Tag::create([
                'slug'      => $tagData['slug'],
                'is_active' => true,
            ]);

            // 2. 各言語の翻訳を保存
            foreach ($tagData['translations'] as $locale => $name) {
                $tag->translations()->create([
                    'locale' => $locale,
                    'name'   => $name,
                ]);
            }
        }
    }
}