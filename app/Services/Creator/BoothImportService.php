<?php

namespace App\Services\Creator;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductTranslation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class BoothImportService
{
    /**
     * BOOTHエクスポートCSVを一括解析して海外出品仕様へコンバート登録
     */
    public function importFromCsv(UploadedFile $file, int $creatorId): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        
        // BOOTHのCSVヘッダー行を読み込み (文字コードをUTF-8へ変換)
        $header = fgetcsv($handle);
        if ($header) {
            $header = array_map(fn($h) => mb_convert_encoding($h, 'UTF-8', 'SJIS-win'), $header);
        }

        $importedCount = 0;
        $skippedCount = 0;
        $rowNumber = 1;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;
                // BOOTHの標準SJISエンコードをクレンジング
                $data = array_map(fn($r) => mb_convert_encoding($r, 'UTF-8', 'SJIS-win'), $row);
                
                // ヘッダーとカラム数を安全に結合
                if (count($header) !== count($data)) {
                    $skippedCount++;
                    continue;
                }
                
                $record = array_combine($header, $data);

                // BOOTH標準CSVカラムの抽出（商品名、価格、識別子など）
                $boothItemName = $record['商品名'] ?? $record['item_name'] ?? null;
                $price = (int) ($record['価格'] ?? $record['price'] ?? 0);
                $stock = (int) ($record['在庫数'] ?? $record['stock'] ?? 0);
                $boothVariantName = $record['バリエーション名'] ?? $record['variant_name'] ?? null;
                $isDigitalStr = $record['デジタル商品フラグ'] ?? $record['is_digital'] ?? '0';

                if (empty($boothItemName)) {
                    $skippedCount++;
                    continue;
                }

                // 既に同一サークルで同名の商品が存在するかチェック（重複インポート防止）
                $product = Product::where('creator_id', $creatorId)
                    ->where('name', $boothItemName)
                    ->first();

                if (!$product) {
                    // 5/20グローバル免税特化仕様の商品レコードを新規作成
                    $product = Product::create([
                        'creator_id' => $creatorId,
                        'category_id' => 1, // デフォルトカテゴリー（同人誌/同人グッズ）
                        'name' => $boothItemName,
                        'price' => $price,
                        'stock_quantity' => empty($boothVariantName) ? $stock : 0,
                        'product_type' => ($isDigitalStr === '1') ? Product::TYPE_DIGITAL : Product::TYPE_PHYSICAL,
                        'status' => 'draft', // 初期状態は安全のため下書き保存
                        'domestic_shipping_method' => 10, // 倉庫一括配送（WAREHOUSE）に一元化
                    ]);

                    // 海外ファン向け多言語翻訳テーブルの自動初期化マッピング
                    ProductTranslation::create([
                        'product_id' => $product->id,
                        'locale' => 'en',
                        'name' => $boothItemName . ' (Imported Global Edition)',
                        'description' => 'Automatically imported from BOOTH shop. English translation details will be updated soon.',
                    ]);

                    ProductTranslation::create([
                        'product_id' => $product->id,
                        'locale' => 'ja',
                        'name' => $boothItemName,
                        'description' => 'BOOTHから自動インポートされた作品データです。',
                    ]);

                    $importedCount++;
                }

                // バリエーション（サイズ違いや種類）が存在する場合の子テーブル同期
                if (!empty($boothVariantName)) {
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'variant_name' => $boothVariantName,
                        'price' => $price,
                        'stock_quantity' => $stock,
                        'sku' => 'BTH-VAR-' . $product->id . '-' . Str::random(5),
                    ]);

                    // バリエーション総数を親商品の在庫総数へ合算反映
                    $product->increment('stock_quantity', $stock);
                }
            }

            DB::commit();
            fclose($handle);

            return [
                'success' => true,
                'imported' => $importedCount,
                'skipped' => $skippedCount
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            Log::error("BOOTH Import Fatal Error at line {$rowNumber}: " . $e->getMessage());
            throw $e;
        }
    }
}