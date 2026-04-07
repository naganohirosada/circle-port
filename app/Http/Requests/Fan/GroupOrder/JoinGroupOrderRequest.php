<?php

namespace App\Http\Requests\Fan\GroupOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JoinGroupOrderRequest extends FormRequest
{
    /**
     * 認証チェック: ログインしているユーザーのみ許可
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            // 配送先住所が自分のものかチェック（fan_id を使用）
            'address_id' => [
                'required',
                Rule::exists('addresses', 'id')->where(function ($query) {
                    $query->where('fan_id', auth()->id());
                }),
            ],

            // アイテム配列のバリデーション
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:group_order_items,id'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric'],
            'items.*.variant_id' => ['nullable'], // 今後用

            'total_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * エラーメッセージの多言語対応（JSONから取得）
     */
    public function messages(): array
    {
        return [
            'address_id.required' => __('Please select a shipping address.'),
            'address_id.exists'   => __('The selected address is invalid.'),
            'items.required'      => __('Please select at least one item.'),
            'items.*.quantity.min' => __('Quantity must be at least 0.'),
        ];
    }

    /**
     * バリデーション前に、数量が0のアイテムを除外する
     */
    protected function prepareForValidation()
    {
        if ($this->has('items')) {
            $this->merge([
                'items' => collect($this->items)
                    ->filter(fn($item) => ($item['quantity'] ?? 0) > 0)
                    ->values()
                    ->all(),
            ]);
        }
    }
}