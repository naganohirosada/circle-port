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
            'recruitment_start_date' => 'required|date|after_or_equal:today',
            'recruitment_end_date' => 'required|date|after:recruitment_start_date',
            'max_participants' => 'required|integer|min:1',
            'shipping_mode' => 'required|in:1,2',
            'is_private' => 'required|boolean',
            'allowed_fans' => 'required_if:is_private,true|array',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }

    /**
     * 翻訳対応したカスタムエラーメッセージ
     */
    public function messages(): array
    {
        return [
            'creator_id.required' => __('Please select a creator.'),
            'title.required' => __('Please enter a title for your GO.'),
            'description.required' => __('Please provide a description.'),
            'recruitment_start_date.required' => __('Please select a start date.'),
            'recruitment_start_date.after_or_equal' => __('Start date must be today or later.'),
            'recruitment_end_date.required' => __('Please select an end date.'),
            'recruitment_end_date.after' => __('End date must be after the start date.'),
            'max_participants.required' => __('Please enter the maximum number of participants.'),
            'max_participants.min' => __('At least 1 participant is required.'),
            'shipping_mode.required' => __('Please select a shipping mode.'),
            'items.required' => __('Please add at least one item to your GO.'),
            'items.min' => __('Please add at least one item to your GO.'),

            // 個別アイテムのバリデーションエラー
            'items.*.price.required' => __('Price is required.'),
            'items.*.price.min' => __('Price cannot be negative.'),
        ];
    }

    /**
     * 属性名の翻訳（エラーメッセージ内の項目名）
     */
    public function attributes(): array
    {
        return [
            'title' => __('Title'),
            'description' => __('Description'),
            'max_participants' => __('Max Participants'),
            'recruitment_start_date' => __('Recruitment Start'),
            'recruitment_end_date' => __('Recruitment End'),
            'shipping_mode' => __('Shipping Mode'),
            'is_private' => __('Privacy Setting'),
        ];
    }
}