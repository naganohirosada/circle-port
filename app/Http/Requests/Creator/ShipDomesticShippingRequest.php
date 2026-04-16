<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShipDomesticShippingRequest extends FormRequest
{
    /**
     * 権限チェック
     * 憲法第1条：認証済みクリエイターのみ許可
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * バリデーションルール
     * 憲法：所有権（creator_id）のチェックをルールに組み込む
     */
    public function rules(): array
    {
        return [
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => [
                'required',
                'integer',
                Rule::exists('domestic_shippings', 'id')->where(function ($query) {
                    $query->where('creator_id', auth()->id());
                }),
            ],
        ];
    }

    /**
     * 日本語エラーメッセージ
     */
    public function messages(): array
    {
        return [
            'ids.required' => '出荷対象が選択されていません。',
            'ids.array'    => '不正なリクエスト形式です。',
            'ids.min'      => '少なくとも1件以上の出荷対象を選択してください。',
            'ids.*.exists' => '選択された配送データが無効であるか、操作権限がありません。',
        ];
    }
}