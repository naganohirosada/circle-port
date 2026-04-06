<?php

namespace App\Http\Requests\Fan\GroupOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GroupOrderStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 憲法：認証済みユーザー（ファン）のみ許可
        return auth()->guard('fan')->check();
    }

    public function rules(): array
    {

        return [
            'creator_id' => 'required|exists:creators,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'recruitment_start_date' => 'required|date',
            'recruitment_end_date' => 'required|date|after:recruitment_start_date',
            'shipping_mode' => ['required', Rule::in(['individual', 'bulk'])],
            'is_private' => 'required|boolean',
            'allowed_fans' => 'nullable|array',
            'allowed_fans.*' => 'exists:fans,id',
            'is_secondary_payment_required' => 'required|boolean',

            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:products,id',
            'items.*.variation_id' => 'nullable|exists:product_variants,id', 
            'items.*.item_name' => 'required|string|max:255', // ★ 追加：アイテム名の検証
            'items.*.price' => 'required|integer|min:0',
            'items.*.stock_limit' => 'required|integer|min:1',
        ];
    }

    /**
     * バリデーションエラーメッセージのカスタマイズ（多言語対応を意識）
     */
    public function attributes(): array
    {
        return [
            'creator_id' => __('Target Creator'),
            'title' => __('Title'),
            'description' => __('Description'),
            'recruitment_start_date' => __('Start Date'),
            'recruitment_end_date' => __('End Date'),
            'shipping_mode' => __('Shipping Mode'),
            'items' => __('Items'),
            'items.*.price' => __('Price'),
            'items.*.stock_limit' => __('Stock Limit'),
        ];
    }
}