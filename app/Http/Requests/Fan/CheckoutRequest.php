<?php
namespace App\Http\Requests\Fan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class CheckoutRequest extends FormRequest
{
    /**
     * 憲法第3条：ファンガードでの認証を確認
     */
    public function authorize(): bool
    {
        return Auth::guard('fan')->check();
    }

    /**
     * 憲法第1条：データの整合性を担保するバリデーションルール
     */
    public function rules(): array
    {
        $fanId = Auth::guard('fan')->id();
        return [
            'shipping_address_id' => [
                'required',
                Rule::exists('addresses', 'id')->where(fn($q) => $q->where('fan_id', $fanId)),
            ],
            'payment_method_id' => [
                'required',
                Rule::exists('payment_methods', 'id')->where(fn($q) => $q->where('fan_id', $fanId)),
            ],

            'cart_data' => ['required', 'array'],

            // その中身のルール
            'cart_data.items' => ['required', 'array', 'min:1'],
            'cart_data.items.*.id' => ['required', 'exists:products,id'],
            'cart_data.items.*.variation_id' => [
                'nullable', // 以前の修正通り nullable
                'exists:product_variants,id'
            ],
            'cart_data.items.*.quantity' => ['required', 'integer', 'min:1'],
            'cart_data.items.*.price' => ['required', 'numeric'],
            
            // 数値の型チェックだけしておく（計算自体は Service でやるが、項目は通す）
            'cart_data.subtotal' => ['required', 'numeric'],
            'cart_data.shipping' => ['required', 'numeric'],
            'cart_data.tax' => ['required', 'numeric'],
            'cart_data.fee' => ['required', 'numeric'],
            'cart_data.total' => ['required', 'numeric'],
        ];
    }
    /**
     * 多言語対応した項目名
     */
    public function attributes(): array
    {
        return [
            'payment_method_id' => __('Payment Method'),
            'cart_data.items' => __('Cart Items'),
            'cart_data.total' => __('Total Amount'),
        ];
    }
}