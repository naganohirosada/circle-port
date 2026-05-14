<?php

namespace App\Http\Requests\Creator\Auth;

use Illuminate\Foundation\Http\FormRequest;

class CreatorRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shop_name' => ['required', 'string', 'max:255', 'unique:creators'],
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:creators'],
            'password'  => ['required', 'string', 'min:8', 'confirmed'],
            
            // SNS (任意)
            'x_id'         => ['nullable', 'string', 'max:100'],
            'pixiv_id'     => ['nullable', 'string', 'max:100'],
            'bluesky_id'   => ['nullable', 'string', 'max:100'],
            'instagram_id' => ['nullable', 'string', 'max:100'],
            'booth_url'    => ['nullable', 'url', 'max:255'],
            'fanbox_url'   => ['nullable', 'url', 'max:255'],

            // 銀行口座 (任意だが形式チェック)
            'bank_name'      => ['nullable', 'string', 'max:100'],
            'branch_name'    => ['nullable', 'string', 'max:100'],
            'account_type'   => ['nullable', 'in:普通,当座'],
            'account_number' => ['nullable', 'digits_between:7,8'],
            'account_holder' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * エラーメッセージの日本語化
     */
    public function messages(): array
    {
        return [
            'required' => ':attributeは必須項目です。',
            'email'    => '正しいメールアドレスの形式で入力してください。',
            'unique'   => 'この:attributeは既に登録されています。',
            'min'      => ':attributeは:min文字以上で入力してください。',
            'confirmed' => ':attributeが一致しません。',
            'url'      => '正しいURL形式で入力してください。',
            'digits_between' => ':attributeは:min〜:max桁で入力してください。',
            'in' => ':attributeは:valuesのいずれかを選択してください。',
        ];
    }

    /**
     * 項目名の日本語化
     */
    public function attributes(): array
    {
        return [
            'shop_name' => 'ショップ名（サークル名）',
            'name'      => '代表者名',
            'email'     => 'メールアドレス',
            'password'  => 'パスワード',
            'booth_url' => 'BOOTH URL',
            'fanbox_url' => 'FANBOX URL',
            'account_number' => '口座番号',
            'bank_name' => '銀行名',
            'branch_name' => '支店名',
            'account_type' => '口座種別',
            'account_holder' => '口座名義',
        ];
    }
}