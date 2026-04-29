<?php
namespace App\Http\Requests\Fan;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'nullable|string|max:1000',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }

    public function attributes(): array
    {
        return [
            'rating'  => '評価',
            'comment' => 'コメント',
            'images'  => '画像',
        ];
    }
}