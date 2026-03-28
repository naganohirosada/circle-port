<?php
namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ProductSearchRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:100',
            'status' => 'nullable|integer|in:1,2,3',
            'category_id' => 'nullable|exists:categories,id',
        ];
    }
}