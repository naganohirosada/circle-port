<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // 所有権チェックはコントローラーで行います
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'target_amount' => ['required', 'numeric', 'min:0'],
            'status'        => ['required', 'integer'],
            'end_date'      => ['required', 'date'],
            'product_ids'   => ['required', 'array', 'min:1'],
            'product_ids.*' => ['exists:products,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'タイトルを入力してください。',
            'product_ids.required' => '商品を少なくとも1つ選択してください。',
        ];
    }
}