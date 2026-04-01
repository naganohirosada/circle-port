<?php

namespace App\Repositories\Eloquent\Payment;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Collection;
use App\Repositories\Interfaces\PaymentRepositoryInterface;

class PaymentRepository implements PaymentRepositoryInterface
{
    /**
     * 特定ファンの決済方法一覧を取得（論理削除済みは除外）
     */
    public function getByFanId(int $fanId): Collection
    {
        return PaymentMethod::where('fan_id', $fanId)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * IDとファンIDで1件取得（セキュリティチェック用）
     */
    public function findByIdAndFan(int $id, int $fanId): ?PaymentMethod
    {
        return PaymentMethod::where('id', $id)->where('fan_id', $fanId)->first();
    }

    /**
     * 新規保存
     */
    public function store(array $data): PaymentMethod
    {
        return PaymentMethod::create($data);
    }

    /**
     * 更新
     */
    public function update(int $id, array $data): bool
    {
        return PaymentMethod::where('id', $id)->update($data);
    }

    /**
     * 削除（論理削除）
     */
    public function delete(int $id): bool
    {
        return PaymentMethod::destroy($id);
    }

    /**
     * 指定ファンの「デフォルト設定」をすべて解除する
     */
    public function resetDefault(int $fanId): void
    {
        PaymentMethod::where('fan_id', $fanId)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}