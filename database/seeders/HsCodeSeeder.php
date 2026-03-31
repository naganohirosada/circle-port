<?php
namespace Database\Seeders;

use App\Models\HsCode;
use Illuminate\Database\Seeder;

class HsCodeSeeder extends Seeder
{
    public function run(): void
    {
        $hsCodes = [
            [
                'code' => '4901.99',
                'name_ja' => '印刷物（同人誌・小説・一般書籍）',
                'name_en' => 'Printed books, brochures and similar printed matter',
            ],
            [
                'code' => '4903.00',
                'name_ja' => '絵本・画集（イラスト集など）',
                'name_en' => 'Children\'s picture, drawing or colouring books',
            ],
            [
                'code' => '3926.40',
                'name_ja' => 'プラスチック製品（アクリルスタンド・アクキー）',
                'name_en' => 'Statuettes and other ornamental articles of plastics',
            ],
            [
                'code' => '7117.19',
                'name_ja' => '卑金属製の身辺用模造細工品（ピンバッジ・メタルキーホルダー）',
                'name_en' => 'Imitation jewelry of base metal',
            ],
            [
                'code' => '6109.10',
                'name_ja' => '綿製Tシャツ（アパレル）',
                'name_en' => 'T-shirts, singlets and other vests, knitted or crocheted, of cotton',
            ],
            [
                'code' => '4911.91',
                'name_ja' => '写真、図像、図案（ポスター・タペストリー）',
                'name_en' => 'Pictures, designs and photographs',
            ],
            [
                'code' => '6304.92',
                'name_ja' => '室内用品（ブランケット・クッションカバー）',
                'name_en' => 'Other furnishing articles, of cotton',
            ],
        ];

        foreach ($hsCodes as $hs) {
            HsCode::create($hs);
        }
    }
}