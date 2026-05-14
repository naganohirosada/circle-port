<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\CategoryTranslation;
use App\Models\SubCategory;
use App\Models\SubCategoryTranslation;
use App\Models\HsCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CategorySeeder extends Seeder
{
    public function run(): void
    {

        Schema::disableForeignKeyConstraints();
        
        Category::truncate();
        CategoryTranslation::truncate();
        SubCategory::truncate();
        SubCategoryTranslation::truncate();

        Schema::enableForeignKeyConstraints();
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Category::truncate();
        CategoryTranslation::truncate();
        SubCategory::truncate();
        SubCategoryTranslation::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // HSコードのIDをコード（6桁）から取得するヘルパー
        $getHsId = function($code) {
            if (!$code) return null;
            // JSON等でドットが含まれている場合を考慮して置換
            $cleanCode = str_replace('.', '', $code);
            return HsCode::where('code', $cleanCode)->first()?->id;
        };

        $data = [
            // --- 01. 本・誌 ---
            [
                'hs' => '490199', // 印刷物一般
                'trans' => ['ja' => '本・誌', 'en' => 'Books & Magazines', 'zh' => '書籍・雜誌', 'ko' => '도서/잡지', 'th' => 'หนังสือและนิตยสาร'],
                'subs' => [
                    ['hs' => '490199', 'name' => ['ja' => '同人誌（漫画）', 'en' => 'Doujinshi (Manga)', 'zh' => '同人誌（漫畫）']],
                    ['hs' => '490199', 'name' => ['ja' => '同人誌（小説）', 'en' => 'Doujinshi (Novels)', 'zh' => '同人誌（小說）']],
                    ['hs' => '490300', 'name' => ['ja' => '画集・イラスト集', 'en' => 'Artbooks', 'zh' => '畫集・原畫集']], // 絵本・画集専用コード
                    ['hs' => '490199', 'name' => ['ja' => '設定資料集・ファンブック', 'en' => 'Fanbooks', 'zh' => '設定資料集']],
                ]
            ],
            // --- 02. アクリル・プラスチック製品 ---
            [
                'hs' => '392640', // プラスチック製小像
                'trans' => ['ja' => 'アクリル・プラスチック', 'en' => 'Acrylic & Plastics', 'zh' => '壓克力 / 塑料', 'ko' => '아크릴/플라스틱', 'th' => 'อะคริลิค'],
                'subs' => [
                    ['hs' => '392640', 'name' => ['ja' => 'アクリルスタンド', 'en' => 'Acrylic Stands', 'zh' => '壓克力立牌']],
                    ['hs' => '392640', 'name' => ['ja' => 'アクリルキーホルダー', 'en' => 'Acrylic Keychains', 'zh' => '壓克力吊飾']],
                    ['hs' => '392640', 'name' => ['ja' => 'アクリルジオラマ', 'en' => 'Acrylic Dioramas', 'zh' => '壓克力場景組']],
                    ['hs' => '392690', 'name' => ['ja' => 'プラスチックコースター', 'en' => 'Plastic Coasters', 'zh' => '塑料杯墊']], // その他のプラスチック製品
                ]
            ],
            // --- 03. バッジ・ピンズ ---
            [
                'hs' => '711719', // 卑金属製模造細工品
                'trans' => ['ja' => 'バッジ・ピンズ', 'en' => 'Badges & Pins', 'zh' => '徽章 / 胸針', 'ko' => '뱃지/핀', 'th' => 'เข็มกลัด'],
                'subs' => [
                    ['hs' => '711719', 'name' => ['ja' => '缶バッジ', 'en' => 'Can Badges', 'zh' => '馬口鐵徽章']],
                    ['hs' => '711719', 'name' => ['ja' => 'ピンバッジ・ピンズ', 'en' => 'Enamel Pins', 'zh' => '金屬徽章']],
                    ['hs' => '392640', 'name' => ['ja' => 'ラバーストラップ', 'en' => 'Rubber Straps', 'zh' => '軟膠吊飾']], // ゴム/プラスチック扱い
                ]
            ],
            // --- 04. ステーショナリー ---
            [
                'hs' => '481720', // 便箋・カード
                'trans' => ['ja' => '文具・ステーショナリー', 'en' => 'Stationery', 'zh' => '文具', 'ko' => '문구', 'th' => 'เครื่องเขียน'],
                'subs' => [
                    ['hs' => '481720', 'name' => ['ja' => 'ポストカード', 'en' => 'Postcards', 'zh' => '明信片']],
                    ['hs' => '482110', 'name' => ['ja' => 'ステッカー・シール', 'en' => 'Stickers', 'zh' => '貼紙']], // 紙製ラベル
                    ['hs' => '392610', 'name' => ['ja' => 'クリアファイル', 'en' => 'Clear Folders', 'zh' => '資料夾']], // 事務用品（プラスチック）
                    ['hs' => '482390', 'name' => ['ja' => 'マスキングテープ', 'en' => 'Masking Tape', 'zh' => '紙膠帶']],
                ]
            ],
            // --- 05. アパレル ---
            [
                'hs' => '610910', // Tシャツ（綿製）
                'trans' => ['ja' => 'アパレル', 'en' => 'Apparel', 'zh' => '服飾', 'ko' => '어패럴', 'th' => 'เสื้อผ้า'],
                'subs' => [
                    ['hs' => '610910', 'name' => ['ja' => 'Tシャツ', 'en' => 'T-shirts', 'zh' => 'T恤']],
                    ['hs' => '611020', 'name' => ['ja' => 'パーカー・スウェット', 'en' => 'Hoodies & Sweatshirts', 'zh' => '連帽衫']],
                    ['hs' => '420222', 'name' => ['ja' => 'トートバッグ・カバン', 'en' => 'Bags', 'zh' => '包袋']], // 紡織材料製バッグ
                    ['hs' => '650500', 'name' => ['ja' => '帽子・キャップ', 'en' => 'Hats & Caps', 'zh' => '帽子']],
                ]
            ],
            // --- 06. インテリア・布製品 ---
            [
                'hs' => '491191', // 写真・図像（ポスター・タペストリー）
                'trans' => ['ja' => 'インテリア・生活雑貨', 'en' => 'Interior', 'zh' => '家居用品', 'ko' => '인테리어', 'th' => 'ตกแต่งบ้าน'],
                'subs' => [
                    ['hs' => '491191', 'name' => ['ja' => 'タペストリー', 'en' => 'Tapestries', 'zh' => '掛軸']],
                    ['hs' => '630492', 'name' => ['ja' => '抱き枕カバー', 'en' => 'Dakimakura Covers', 'zh' => '等身抱枕套']], // 綿製室内用品
                    ['hs' => '630130', 'name' => ['ja' => 'ブランケット・毛布', 'en' => 'Blankets', 'zh' => '毛毯']],
                    ['hs' => '630492', 'name' => ['ja' => 'クッション・枕', 'en' => 'Cushions', 'zh' => '靠枕']],
                ]
            ],
            // --- 07. 雑貨・玩具 ---
            [
                'hs' => '950300', // 玩具一般（ぬいぐるみ、フィギュア）
                'trans' => ['ja' => '雑貨・おもちゃ', 'en' => 'Toys & Goods', 'zh' => '雜貨 / 玩具', 'ko' => '잡화/완구', 'th' => 'สินค้าเบ็ดเตล็ด'],
                'subs' => [
                    ['hs' => '950300', 'name' => ['ja' => 'ぬいぐるみ', 'en' => 'Plushies', 'zh' => '玩偶']],
                    ['hs' => '392690', 'name' => ['ja' => 'スマホケース', 'en' => 'Phone Cases', 'zh' => '手機殼']],
                    ['hs' => '691200', 'name' => ['ja' => 'マグカップ・食器', 'en' => 'Mugs & Tableware', 'zh' => '馬克杯']],
                ]
            ],
            // --- 08. デジタルコンテンツ ---
            [
                'hs' => null, // 配送なし
                'trans' => ['ja' => 'デジタルコンテンツ', 'en' => 'Digital Content', 'zh' => '電子出版', 'ko' => '디지털 콘텐츠', 'th' => 'ดิจิทัลคอนเทนต์'],
                'subs' => [
                    ['hs' => null, 'name' => ['ja' => 'イラストデータ', 'en' => 'Illustrations', 'zh' => '插畫數據']],
                    ['hs' => null, 'name' => ['ja' => '音楽・ボイス', 'en' => 'Music & Voice', 'zh' => '音樂 / 語音']],
                    ['hs' => null, 'name' => ['ja' => '3Dモデル', 'en' => '3D Models', 'zh' => '3D模型']],
                ]
            ],
        ];

        $locales = ['ja', 'en', 'zh', 'th', 'id', 'vi', 'fr', 'de', 'ko'];

        foreach ($data as $cItem) {
            // 親カテゴリの作成
            $category = Category::create([
                'status' => 1,
                'display_order' => 0,
                'default_hs_code_id' => $getHsId($cItem['hs']),
                'name_ja' => $cItem['trans']['ja'], // 互換性のため
                'name_en' => $cItem['trans']['en']  // 互換性のため
            ]);

            // 親カテゴリの翻訳登録
            foreach ($locales as $locale) {
                CategoryTranslation::create([
                    'category_id' => $category->id,
                    'locale' => $locale,
                    'name' => $cItem['trans'][$locale] ?? $cItem['trans']['en'] ?? $cItem['trans']['ja']
                ]);
            }

            // サブカテゴリの作成
            foreach ($cItem['subs'] as $sItem) {
                $subCategory = SubCategory::create([
                    'category_id' => $category->id,
                    'sort_order' => 0,
                    'default_hs_code_id' => $getHsId($sItem['hs']),
                    'name_ja' => $sItem['name']['ja'], // 互換性のため
                    'name_en' => $sItem['name']['en']  // 互換性のため
                ]);

                // サブカテゴリの翻訳登録
                foreach ($locales as $locale) {
                    SubCategoryTranslation::create([
                        'sub_category_id' => $subCategory->id,
                        'locale' => $locale,
                        'name' => $sItem['name'][$locale] ?? $sItem['name']['en'] ?? $sItem['name']['ja']
                    ]);
                }
            }
        }
    }
}