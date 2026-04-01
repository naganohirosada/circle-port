<?php

namespace App\Http\Requests\Fan\Mypage;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', Rule::unique('users', 'email')->ignore(auth()->id())],
            'country_id'    => ['required', 'exists:countries,id'],
            'language_id'   => ['required', 'exists:languages,id'],
            'currency_id'   => ['required', 'exists:currencies,id'],
            'timezone_id'   => ['required', 'exists:timezones,id'],
        ];
    }

    /**
     * 憲法：エラーメッセージでカラム名（timezone_id等）が露出しないよう、翻訳名を定義する
     */
    public function attributes(): array
    {
        return [
            'name'          => __('Full Name'),
            'email'         => __('Email Address'),
            'country_id'    => __('Country of Residence'),
            'language_id'   => __('Preferred Language'),
            'currency_id'   => __('Preferred Currency'),
            'timezone_id'   => __('Timezone'),
        ];
    }
}