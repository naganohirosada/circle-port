<?php

namespace App\Http\Requests\Fan\Mypage;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'phone'         => ['required', 'string', 'max:20'],
            'country_id'    => ['required', 'exists:countries,id'],
            'postal_code'   => ['required', 'string', 'max:20'],
            'state'         => ['required', 'string', 'max:255'],
            'city'          => ['required', 'string', 'max:255'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'is_default'    => ['boolean'],
        ];
    }
}