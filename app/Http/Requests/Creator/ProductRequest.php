<?php
namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $rules = [
            'category_id'    => 'required|exists:categories,id',
            'name_ja'        => 'required|string|max:255',
            'description_ja' => 'required|string',
            'status'         => 'required|integer|in:1,2,3',
            'has_variants'   => 'required|boolean',
            'images.*'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MBまで
        ];

        if ($this->has_variants) {
            // バリエーションありの場合
            $rules['variants'] = 'required|array|min:1';
            $rules['variants.*.variant_name_ja'] = 'required|string|max:255';
            $rules['variants.*.price']          = 'required|integer|min:0';
            $rules['variants.*.stock_quantity'] = 'required|integer|min:0';
            $rules['variants.*.weight_g']       = 'required|integer|min:0';
        } else {
            // 単品の場合
            $rules['price']          = 'required|integer|min:0';
            $rules['stock_quantity'] = 'required|integer|min:0';
            $rules['weight_g']       = 'required|integer|min:0';
        }

        return $rules;
    }
}