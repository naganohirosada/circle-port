<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\CategoryTranslation;
use App\Models\SubCategory;
use App\Models\SubCategoryTranslation;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Category::truncate();
        CategoryTranslation::truncate();
        SubCategory::truncate();
        SubCategoryTranslation::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $data = [
            // 1. 本・誌
            [
                'slug' => 'books',
                'trans' => ['ja' => '本・誌', 'en' => 'Books & Magazines', 'en-us' => 'Books & Magazines', 'zh' => '書籍・雜誌', 'fr' => 'Livres et Magazines', 'th' => 'หนังสือและนิตยสาร'],
                'subs' => [
                    ['ja' => '同人誌（漫画）', 'en' => 'Doujinshi (Manga)', 'en-us' => 'Doujinshi (Manga)', 'zh' => '同人誌（漫畫）', 'fr' => 'Doujinshi (Manga)', 'th' => 'โดจินชิ (มังงะ)'],
                    ['ja' => '同人誌（小説）', 'en' => 'Doujinshi (Novels)', 'en-us' => 'Doujinshi (Novels)', 'zh' => '同人誌（小說）', 'fr' => 'Doujinshi (Romans)', 'th' => 'โดจินชิ (นิยาย)'],
                    ['ja' => 'イラスト集・画集', 'en' => 'Artbooks', 'en-us' => 'Art Books', 'zh' => '畫集・原畫集', 'fr' => 'Livres d\'art', 'th' => 'สมุดภาพ'],
                    ['ja' => '設定資料集', 'en' => 'Setting Documents', 'en-us' => 'Production Art Books', 'zh' => '設定資料集', 'fr' => 'Documents de conception', 'th' => 'สมุดรวมข้อมูลตั้งค่า'],
                ]
            ],
            // 2. アクセサリー
            [
                'slug' => 'accessories',
                'trans' => ['ja' => 'アクセサリー', 'en' => 'Accessories', 'en-us' => 'Accessories', 'zh' => '配飾 / 周邊', 'fr' => 'Accessoires', 'th' => 'เครื่องประดับ'],
                'subs' => [
                    ['ja' => 'アクリルスタンド', 'en' => 'Acrylic Stands', 'en-us' => 'Acrylic Stands', 'zh' => '壓克力立牌', 'fr' => 'Supports en acrylique', 'th' => 'แสแตนด์อะคริลิค'],
                    ['ja' => 'アクリルキーホルダー', 'en' => 'Acrylic Keychains', 'en-us' => 'Acrylic Keychains', 'zh' => '壓克力吊飾', 'fr' => 'Porte-clés en acrylique', 'th' => 'พวงกุญแจอะคริลิค'],
                    ['ja' => '缶バッジ', 'en' => 'Can Badges', 'en-us' => 'Pin-Back Buttons', 'zh' => '徽章', 'fr' => 'Badges', 'th' => 'เข็มกลัด'],
                    ['ja' => 'ピンバッジ', 'en' => 'Pin Badges', 'en-us' => 'Enamel Pins', 'zh' => '胸針', 'fr' => 'Pins', 'th' => 'พินบัッジ'],
                ]
            ],
            // 3. アパレル
            [
                'slug' => 'apparel',
                'trans' => ['ja' => 'アパレル', 'en' => 'Apparel', 'en-us' => 'Clothing', 'zh' => '服飾', 'fr' => 'Vêtements', 'th' => 'เสื้อผ้า'],
                'subs' => [
                    ['ja' => 'Tシャツ', 'en' => 'T-shirts', 'en-us' => 'T-shirts', 'zh' => 'T恤', 'fr' => 'T-shirts', 'th' => 'เสื้อยืด'],
                    ['ja' => 'パーカー', 'en' => 'Hoodies', 'en-us' => 'Hoodies', 'zh' => '連帽衫', 'fr' => 'Sweats à capuche', 'th' => 'เสื้อฮู้ด'],
                    ['ja' => 'トートバッグ', 'en' => 'Tote Bags', 'en-us' => 'Tote Bags', 'zh' => '托特包', 'fr' => 'Sacs cabas', 'th' => 'กระเป๋าโท้ท'],
                    ['ja' => 'キャップ', 'en' => 'Caps', 'en-us' => 'Caps & Hats', 'zh' => '帽子', 'fr' => 'Casquettes', 'th' => 'หมวก'],
                ]
            ],
            // 4. 雑貨・インテリア
            [
                'slug' => 'goods',
                'trans' => ['ja' => '雑貨・インテリア', 'en' => 'Goods & Interior', 'en-us' => 'Home & Collectibles', 'zh' => '生活雜貨', 'fr' => 'Produits et Intérieur', 'th' => 'สินค้าทั่วไปและตกแต่งบ้าน'],
                'subs' => [
                    ['ja' => 'タペストリー', 'en' => 'Tapestries', 'en-us' => 'Wall Scrolls', 'zh' => '掛軸', 'fr' => 'Tapisseries', 'th' => 'ภาพแขวน'],
                    ['ja' => '抱き枕カバー', 'en' => 'Dakimakura Covers', 'en-us' => 'Body Pillow Covers', 'zh' => '等身抱枕套', 'fr' => 'Housses de Dakimakura', 'th' => 'ปลอกหมอนข้าง'],
                    ['ja' => 'ブランケット', 'en' => 'Blankets', 'en-us' => 'Blankets', 'zh' => '毯子', 'fr' => 'Couvertures', 'th' => 'ผ้าห่ม'],
                    ['ja' => 'マグカップ', 'en' => 'Mugs', 'en-us' => 'Mugs', 'zh' => '馬克杯', 'fr' => 'Mugs', 'th' => 'แก้วมัค'],
                ]
            ],
            // 5. デジタル
            [
                'slug' => 'digital',
                'trans' => ['ja' => 'デジタル', 'en' => 'Digital Contents', 'en-us' => 'Digital Downloads', 'zh' => '數位內容', 'fr' => 'Contenu numérique', 'th' => 'เนื้อหาดิจิทัล'],
                'subs' => [
                    ['ja' => 'ゲーム', 'en' => 'Games', 'en-us' => 'Games', 'zh' => '遊戲', 'fr' => 'Jeux', 'th' => 'เกม'],
                    ['ja' => 'ボイスデータ', 'en' => 'Voice Data', 'en-us' => 'ASMR / Voice Clips', 'zh' => '語音數據', 'fr' => 'Données vocales', 'th' => 'ข้อมูลเสียง'],
                    ['ja' => '音楽・楽曲', 'en' => 'Music', 'en-us' => 'Music & Tracks', 'zh' => '音樂', 'fr' => 'Musique', 'th' => 'ดนตรี'],
                    ['ja' => 'デジタル画集', 'en' => 'Digital Artbooks', 'en-us' => 'Digital Art Books', 'zh' => '數位畫集', 'fr' => 'Livres d\'art numériques', 'th' => 'สมุดภาพดิจิทัล'],
                ]
            ],
        ];

        foreach ($data as $cItem) {
            $category = Category::create([
                'status' => 1,
                'display_order' => 0,
                'name_ja' => $cItem['trans']['ja'],
                'name_en' => $cItem['trans']['en'],
            ]);

            foreach ($cItem['trans'] as $lang => $val) {
                CategoryTranslation::create([
                    'category_id' => $category->id,
                    'locale' => $lang,
                    'name' => $val
                ]);
            }

            foreach ($cItem['subs'] as $sItem) {
                $subCategory = SubCategory::create([
                    'category_id' => $category->id,
                    'sort_order' => 0,
                    'name_ja' => $sItem['ja'],
                    'name_en' => $sItem['en'],
                ]);

                foreach ($sItem as $lang => $val) {
                    SubCategoryTranslation::create([
                        'sub_category_id' => $subCategory->id,
                        'locale' => $lang,
                        'name' => $val
                    ]);
                }
            }
        }
    }
}