<?php

namespace App\Repositories\Interfaces;

use App\Models\PaymentMethod;

interface PaymentMethodRepositoryInterface
{
    /**
     * ファンのデフォルト決済方法を取得
     */
    public function getDefaultPaymentMethod(int $fanId);

    /**
     * 指定されたファンのすべての決済方法のデフォルト設定を解除
     */
    public function clearDefaultStatus(int $fanId): void;

    /**
     * 決済方法を保存または更新
     */
    public function updateOrCreatePaymentMethod(array $match, array $data);
}