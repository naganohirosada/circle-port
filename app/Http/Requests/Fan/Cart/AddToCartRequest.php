<?php

namespace App\Http\Requests\Fan\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id'   => ['required', 'exists:products,id,deleted_at,NULL'],
            'variation_id' => ['nullable', 'exists:product_variations,id,deleted_at,NULL'],
            'quantity'     => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}