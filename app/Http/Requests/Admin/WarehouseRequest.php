<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class WarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'postal_code'  => ['required', 'string', 'max:10'],
            'address'      => ['required', 'string', 'max:255'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:20'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'         => '倉庫名',
            'postal_code'  => '郵便番号',
            'address'      => '住所',
            'recipient_name' => '登録名',
            'phone'        => '電話番号',
        ];
    }
}