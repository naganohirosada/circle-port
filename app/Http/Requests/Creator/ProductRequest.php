<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $isPhysical = $this->input('product_type') == 1;
        $isDigital  = $this->input('product_type') == 2;
        // フロントエンドのキー名 'variations' に合わせる
        $hasVariants = $this->has('variations') && count($this->input('variations', [])) > 0;

        return [
            // --- 共通基本項目 ---
            'product_type'     => 'required|in:1,2',
            'category_id'      => 'required|exists:categories,id',
            'sub_category_id'  => 'nullable|exists:sub_categories,id',
            'tag_ids'          => 'nullable|array',
            'tag_ids.*'        => 'exists:tags,id',

            'price' => $hasVariants 
                ? 'nullable|integer|min:0' 
                : 'required|integer|min:0',

            // 現物かつバリエーションがない場合のみ必須
            'stock' => ($isPhysical && !$hasVariants) 
                ? 'required|integer|min:0' 
                : 'nullable|integer',

            'weight' => ($isPhysical && !$hasVariants) 
                ? 'required|integer|min:0' 
                : 'nullable|integer',

            'hs_code_id' => ($isPhysical && !$hasVariants) 
                ? 'required|exists:hs_codes,id' 
                : 'nullable',

            // --- 多言語項目 (ネストされたオブジェクト) ---
            'name.ja'          => 'required|string|max:255',
            'name.en'          => 'nullable|string|max:255',
            'name.zh'          => 'nullable|string|max:255',
            'name.th'          => 'nullable|string|max:255',
            'name.fr'          => 'nullable|string|max:255',

            'description.ja'   => 'required|string',
            'description.en'   => 'nullable|string',
            'description.zh'   => 'nullable|string',
            'description.th'   => 'nullable|string',
            'description.fr'   => 'nullable|string',

            'material.ja'      => $isPhysical ? 'nullable|string|max:255' : 'nullable',
            'material.en'      => 'nullable|string|max:255',
            'material.zh'      => 'nullable|string|max:255',
            'material.th'      => 'nullable|string|max:255',
            'material.fr'      => 'nullable|string|max:255',

            // --- メディア ---
            'images'           => 'nullable|array',
            'images.*'         => 'image|mimes:jpeg,png,jpg,webp|max:10240',

            // --- デジタル作品(2)固有のバリデーション ---
            // バリエーションがない場合のみ、本体メインファイルのアップロードを必須とする
            'digital_file'     => ($isDigital && !$hasVariants) ? 'required|file|max:512000' : 'nullable',

            // --- バリエーション (配列名: variations) ---
            'variations'       => 'nullable|array',
            // バリエーション内の翻訳名は variant_name
            'variations.*.variant_name.ja' => 'required_with:variations|string|max:255',
            'variations.*.price'           => 'required_with:variations|integer|min:0',
            // バリエーション内の現物固有項目
            'variations.*.stock'           => $isPhysical ? 'required_with:variations|integer|min:0' : 'nullable',
            'variations.*.weight'          => $isPhysical ? 'required_with:variations|integer|min:0' : 'nullable',
            'variations.*.hs_code_id'      => $isPhysical ? 'required_with:variations|exists:hs_codes,id' : 'nullable',

            // バリエーション内のデジタル固有項目
            'variations.*.digital_file'    => ($isDigital && $hasVariants) ? 'required_with:variations|file|max:512000' : 'nullable',
        ];
    }

    public function attributes(): array
    {
        return [
            'name.ja'                 => '作品名(日本語)',
            'description.ja'          => '作品説明(日本語)',
            'price'                   => '価格',
            'stock'                   => '在庫数',
            'weight'                  => '重量',
            'hs_code_id'              => 'HSコード',
            'digital_file'            => '配信ファイル',
            'variations.*.variant_name.ja' => 'バリエーション名(日本語)',
            'variations.*.price'           => 'バリエーション価格',
            'variations.*.stock'           => 'バリエーション在庫数',
            'variations.*.digital_file'    => 'バリエーション用ファイル',
        ];
    }

    public function messages(): array
    {
        return [
            'required'         => ':attribute は必須項目です。',
            'digital_file.required' => 'デジタル作品の場合、配信ファイルをアップロードしてください。',
            'variations.*.variant_name.ja.required_with' => 'バリエーション名を入力してください。',
            'variations.*.digital_file.required_with'    => '各バリエーションのファイルをアップロードしてください。',
        ];
    }
}