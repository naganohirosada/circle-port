<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'carrier_id' => ['required', 'string', 'max:50'],
            'tracking_number' => ['required', 'string', 'max:100', 'alpha_num'],
        ];
    }

    public function messages(): array
    {
        return [
            'carrier_id.required' => '配送業者名を入力してください。',
            'tracking_number.required' => '追跡番号を入力してください。',
            'tracking_number.alpha_num' => '追跡番号は英数字で入力してください。',
        ];
    }
}