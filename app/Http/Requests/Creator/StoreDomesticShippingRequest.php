<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 国内配送登録用バリデーション
 * 憲法第1条：堅牢性（データの整合性を入り口で担保）
 */
class StoreDomesticShippingRequest extends FormRequest
{
    /**
     * ユーザーがこのリクエストを行う権限があるか
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * バリデーションエラーメッセージ（任意）
     */
    public function messages(): array
    {
        return [
            'items.required' => '配送するアイテムを1つ以上選択してください。',
            'items.*.product_id.required' => '商品を選択してください。',
            'items.*.product_id.exists' => '選択された商品は無効です。',
            'items.*.variant_id.exists' => '選択されたバリエーションは無効です。',
            'items.*.quantity.required' => '数量を入力してください。',
            'items.*.quantity.min' => '数量は1以上で入力してください。',
        ];
    }
}