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
            'language_id' => ['required', 'exists:languages,id'],
            'unique_id' => ['required', 'string', 'alpha_dash', 'min:4', 'max:15', 'unique:fans,unique_id'],
        ];
    }

    /**
     * カスタムエラーメッセージの定義
     */
    public function messages(): array
    {
        return [
            'name.required' => __('The name field is required.'),
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
            'email.unique' => __('The email has already been taken.'),
            'password.required' => __('The password field is required.'),
            'password.min' => __('The password must be at least 8 characters.'),
            'password.confirmed' => __('The password confirmation does not match.'),
            'country_id.required' => __('Please select your country.'),
            'language_id.required' => __('Please select your language.'),
            'unique_id.required' => __('The user ID field is required.'),
            'unique_id.unique' => __('This user ID is already taken.'),
            'unique_id.alpha_dash' => __('The user ID may only contain letters, numbers, dashes and underscores.'),
            'unique_id.min' => __('The user ID must be at least 4 characters.'),
            'unique_id.max' => __('The user ID may not be greater than 15 characters.'),
        ];
    }
}