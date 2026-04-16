<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * 憲法：権限チェック
     */
    public function authorize(): bool
    {
        // クリエイターとしての認証はミドルウェアで行っているため、ここではtrue
        return true;
    }

    /**
     * プロジェクト作成時のバリデーションルール
     */
    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'target_amount' => ['required', 'numeric', 'min:0'],
            'delivery_date' => ['required', 'date', 'after:today'],
            'end_date'      => ['required', 'date', 'after:today'],
            'product_ids'   => ['required', 'array', 'min:1'],
            'product_ids.*' => ['exists:products,id'], // IDの存在チェックも追加
        ];
    }

    /**
     * カスタムエラーメッセージ
     */
    public function messages(): array
    {
        return [
            'title.required'         => 'プロジェクトのタイトルは必須です。',
            'target_amount.required' => '目標金額を入力してください。',
            'delivery_date.required' => 'お届け予定日を設定してください。',
            'delivery_date.after'    => 'お届け予定日は明日以降の日付を指定してください。',
            'end_date.required'      => '募集終了日を設定してください。',
            'product_ids.required'   => 'プロジェクトに紐付ける商品を1つ以上選択してください。',
        ];
    }
}