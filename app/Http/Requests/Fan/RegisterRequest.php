<?php
namespace App\Http\Requests\Fan;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:fans'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'country_id' => ['required', 'exists:countries,id'],
        ];
    }
}