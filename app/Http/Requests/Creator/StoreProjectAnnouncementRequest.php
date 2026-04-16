<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'title'    => ['required', 'string', 'max:255'],
            'content'  => ['required', 'string', 'min:10'],
            'type'     => ['required', 'string', 'in:update,report,important'],
            'images'   => ['nullable', 'array', 'max:5'], // 最大5枚までに制限
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'タイトルを入力してください。',
            'content.required' => '報告内容を入力してください。',
            'content.min'      => '内容は10文字以上で入力してください。',
        ];
    }
}