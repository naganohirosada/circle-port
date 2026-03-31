<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // has_variants の値を真偽値として取得
        $hasVariants = filter_var($this->input('has_variants'), FILTER_VALIDATE_BOOLEAN);

        return [
            // 共通項目
            'name_ja'          => 'required|string|max:255',
            'description_ja'   => 'required|string',
            'category_id'      => 'required|exists:categories,id',
            'sub_category_id'  => 'nullable|exists:sub_categories,id',
            'status'           => 'required|integer|in:1,2,3',
            'has_variants'     => 'required|boolean',

            'images'           => 'nullable|array',
            'new_images'       => 'nullable|array',
            'delete_image_ids' => 'nullable|array',
            'images.*'         => 'image|mimes:jpeg,png,jpg,webp|max:10240',
            'thumbnail_key'    => 'nullable|string',

            // --- 単品販売（has_variants が false）の時のみ必須 ---
            'price'            => 'required_if:has_variants,0,false|nullable|integer|min:0',
            'stock_quantity'   => 'required_if:has_variants,0,false|nullable|integer|min:0',
            'weight_g'         => 'required_if:has_variants,0,false|nullable|integer|min:0',
            'material_ja'      => 'required_if:has_variants,0,false|nullable|string|max:255',
            'hs_code_id'       => 'required_if:has_variants,0,false|nullable|exists:hs_codes,id',

            // --- バリエーションあり（has_variants が true）の時のみ必須 ---
            // exclude_if を使うことで、has_variants が false の時はこの項目自体をバリデーション対象から除外します
            'variants'         => 'exclude_if:has_variants,0,false|required|array|min:1',
            'variants.*.variant_name_ja' => 'exclude_if:has_variants,0,false|required|string|max:255',
            'variants.*.price'           => 'exclude_if:has_variants,0,false|required|integer|min:0',
            'variants.*.stock_quantity'  => 'exclude_if:has_variants,0,false|required|integer|min:0',
            'variants.*.weight_g'        => 'exclude_if:has_variants,0,false|nullable|integer|min:0',
            'variants.*.material_ja'     => 'exclude_if:has_variants,0,false|nullable|string|max:255',
            'variants.*.hs_code_id'      => 'exclude_if:has_variants,0,false|nullable|exists:hs_codes,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name_ja.required'        => '作品名は必須です。',
            'description_ja.required' => '作品説明は必須です。',
            'category_id.required'    => 'カテゴリーを選択してください。',
            
            // 単品エラー
            'price.required_if'          => '販売価格を入力してください。',
            'stock_quantity.required_if' => '在庫数を入力してください。',
            'weight_g.required_if'       => '重量を入力してください。',
            'material_ja.required_if'    => '素材を入力してください。',
            'hs_code_id.required_if'     => 'HSコードを選択してください。',

            // バリエーション全体エラー (exclude_ifで外れるため required メッセージでOK)
            'variants.required' => 'バリエーション情報を入力してください。',
            'variants.min'      => 'バリエーションを最低1つは登録する必要があります。',
            
            // バリエーション個別エラー
            'variants.*.variant_name_ja.required' => 'バリエーション名（サイズや色など）を入力してください。',
            'variants.*.price.required'           => 'このバリエーションの価格を入力してください。',
            'variants.*.stock_quantity.required'  => 'このバリエーションの在庫数を入力してください。',
        ];
    }
}