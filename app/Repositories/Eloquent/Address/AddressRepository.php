<?php

namespace App\Repositories\Eloquent\Address;

use App\Models\Address;
use Illuminate\Database\Eloquent\Collection;
use App\Repositories\Interfaces\AddressRepositoryInterface;

class AddressRepository implements AddressRepositoryInterface
{
    public function getByUserId(int $userId): Collection
    {
        return Address::where('fan_id', $userId)
            ->with('country') // 憲法：国情報はリレーションで取得
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByIdAndUser(int $id, int $userId): ?Address
    {
        return Address::where('id', $id)->where('fan_id', $userId)->first();
    }

    public function store(array $data): Address
    {
        return Address::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Address::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Address::destroy($id); // ModelでSoftDeletesを使っていれば自動で論理削除
    }

    public function resetDefault(int $userId): void
    {
        Address::where('fan_id', $userId)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}