<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::guard('creator')->check();
    }

    public function rules(): array
    {
        return [
            'bank_name'      => 'required|string|max:255',
            'branch_name'    => 'required|string|max:255',
            'account_type'   => 'required|string|in:普通,当座',
            'account_number' => 'required|string|max:20',
            'account_holder' => 'required|string|max:255', // 全角カナ等のバリデーションは必要に応じて追加
        ];
    }

    public function attributes(): array
    {
        return [
            'bank_name'      => '銀行名',
            'branch_name'    => '支店名',
            'account_type'   => '口座種別',
            'account_number' => '口座番号',
            'account_holder' => '口座名義',
        ];
    }
}