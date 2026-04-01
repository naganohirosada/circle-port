<?php

namespace App\Repositories\Interfaces;

use App\Models\Address;
use Illuminate\Database\Eloquent\Collection;

interface AddressRepositoryInterface
{
    /**
     * 特定ユーザーの住所一覧を取得（論理削除済みは除外）
     */
    public function getByUserId(int $userId): Collection;

    /**
     * IDとユーザーIDで1件取得
     */
    public function findByIdAndUser(int $id, int $userId): ?Address;

    /**
     * 新規保存
     */
    public function store(array $data): Address;

    /**
     * 更新
     */
    public function update(int $id, array $data): bool;

    /**
     * 削除（論理削除）
     */
    public function delete(int $id): bool;

    /**
     * 指定ユーザーの「デフォルト設定」をすべて解除する
     */
    public function resetDefault(int $userId): void;
}