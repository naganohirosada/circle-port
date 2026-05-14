<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /**
     * バリデーションルール
     * Create.jsx の useForm 初期値および送信データ構造に準拠
     */
    public function rules(): array
    {
        $isPhysical = $this->input('product_type') == 1;
        $isDigital  = $this->input('product_type') == 2;
        // variations 配列が存在し、1つ以上データがあるか
        $hasVariants = $this->has('variations') && count($this->input('variations', [])) > 0;

        // Create.jsx で定義されている全9言語
        $locales = ['ja', 'en', 'zh', 'th', 'id', 'vi', 'fr', 'de', 'ko'];

        $rules = [
            // --- 共通項目 ---
            'product_type'     => 'required|in:1,2',
            'category_id'      => 'required|exists:categories,id',
            'sub_category_id'  => 'nullable|exists:sub_categories,id',
            'tag_ids'          => 'nullable|array',
            'tag_ids.*'        => 'exists:tags,id',
            
            // バリエーションがある場合は共通の価格・在庫等は任意（バリエーション側が優先）
            'price'            => $hasVariants ? 'nullable|integer|min:0' : 'required|integer|min:0',
            'stock'            => ($isPhysical && !$hasVariants) ? 'required|integer|min:0' : 'nullable|integer',
            'weight'           => ($isPhysical && !$hasVariants) ? 'required|integer|min:0' : 'nullable|integer',
            'hs_code_id'       => ($isPhysical && !$hasVariants) ? 'required|exists:hs_codes,id' : 'nullable',
            
            'images'           => 'required|array|min:1',
            'images.*'         => 'image|mimes:jpeg,png,jpg,webp|max:10240',
            
            'digital_file'     => ($isDigital && !$hasVariants) ? 'required|file|max:512000' : 'nullable',
        ];

        // --- 多言語項目のバリデーション (name, description, material) ---
        foreach ($locales as $locale) {
            // 日本語(ja)のみ必須、他は任意
            $rules["name.$locale"] = ($locale === 'ja') ? 'required|string|max:255' : 'nullable|string|max:255';
            $rules["description.$locale"] = ($locale === 'ja') ? 'required|string' : 'nullable|string';
            $rules["material.$locale"] = 'nullable|string|max:255';
            
            // バリエーション内の多言語名
            if ($hasVariants) {
                $rules["variations.*.variant_name.$locale"] = ($locale === 'ja') 
                    ? 'required_with:variations|string|max:255' 
                    : 'nullable|string|max:255';
            }
        }

        // --- バリエーション共通項目 ---
        if ($hasVariants) {
            $rules['variations.*.price']        = 'required|integer|min:0';
            $rules['variations.*.stock']        = $isPhysical ? 'required|integer|min:0' : 'nullable';
            $rules['variations.*.weight']       = $isPhysical ? 'required|integer|min:0' : 'nullable';
            $rules['variations.*.hs_code_id']   = $isPhysical ? 'required|exists:hs_codes,id' : 'nullable';
            $rules['variations.*.digital_file'] = $isDigital ? 'required|file|max:512000' : 'nullable';
        }

        return $rules;
    }

    /**
     * 属性名の日本語訳
     * Create.jsx の各 InputError の message キーと完全一致させる必要があります
     */
    public function attributes(): array
    {
        $langNames = [
            'ja' => '日本語', 'en' => '英語', 'zh' => '中国語', 'th' => 'タイ語',
            'id' => 'インドネシア語', 'vi' => 'ベトナム語', 'fr' => 'フランス語',
            'de' => 'ドイツ語', 'ko' => '韓国語'
        ];

        $attrs = [
            'product_type'    => '作品形式',
            'category_id'     => 'カテゴリー',
            'sub_category_id' => 'サブカテゴリー',
            'tag_ids'         => '検索タグ',
            'price'           => '価格',
            'stock'           => '在庫数',
            'weight'          => '重量',
            'hs_code_id'      => 'HSコード',
            'images'          => '商品画像',
            'digital_file'    => '配信ファイル',
            'variations'      => 'バリエーション',
        ];

        // 各言語ごとの属性名を生成
        foreach ($langNames as $code => $name) {
            $attrs["name.$code"] = "作品名($name)";
            $attrs["description.$code"] = "作品説明($name)";
            $attrs["material.$code"] = "素材($name)";
            
            // バリエーション内の名前（ドット記法 variations.*.variant_name.ja に対応）
            $attrs["variations.*.variant_name.$code"] = "バリエーション名($name)";
        }

        // バリエーション詳細項目
        $attrs['variations.*.price'] = 'バリエーション価格';
        $attrs['variations.*.stock'] = 'バリエーション在庫数';
        $attrs['variations.*.weight'] = 'バリエーション重量';
        $attrs['variations.*.hs_code_id'] = 'バリエーションHSコード';
        $attrs['variations.*.digital_file'] = 'バリエーション用配信ファイル';

        return $attrs;
    }

    public function messages(): array
    {
        return [
            'required'      => ':attribute は必須項目です。',
            'required_with' => ':attribute を入力してください。',
            'integer'       => ':attribute は数値で入力してください。',
            'min'           => ':attribute は :min 以上の値を入力してください。',
            'max'           => ':attribute は :max 以内で入力してください。',
            'exists'        => '選択された :attribute は無効です。',
            'image'         => ':attribute は画像ファイルを選択してください。',
            'mimes'         => ':attribute は :values 形式のファイルである必要があります。',
            'array'         => ':attribute は配列形式で入力してください。',
            'file'          => ':attribute はファイル形式である必要があります。',
            'required_if'   => ':other が :value の場合、:attribute は必須です。',
        ];
    }
}