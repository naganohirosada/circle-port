<?php

namespace App\Repositories\Eloquent\Payment;

use App\Models\PaymentMethod;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;

class PaymentMethodRepository implements PaymentMethodRepositoryInterface
{
    /**
     * ファンのデフォルト決済方法を取得
     */
    public function getDefaultPaymentMethod(int $fanId)
    {
        return PaymentMethod::where('fan_id', $fanId)
            ->where('is_default', 1)
            ->first();
    }

    /**
     * 全てのデフォルトフラグを落とす
     */
    public function clearDefaultStatus(int $fanId): void
    {
        PaymentMethod::where('fan_id', $fanId)
            ->update(['is_default' => 0]);
    }

    /**
     * 新しい決済方法の登録、または既存情報の更新
     */
    public function updateOrCreatePaymentMethod(array $match, array $data)
    {
        return PaymentMethod::updateOrCreate($match, $data);
    }
}