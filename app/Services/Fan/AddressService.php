<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\AddressRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AddressService
{
    protected $addressRepo;

    public function __construct(AddressRepositoryInterface $addressRepo)
    {
        $this->addressRepo = $addressRepo;
    }

    /**
     * 1. ユーザーの住所一覧を取得 (今回エラーが出ていた箇所)
     * @param int $fanId
     * @return Collection
     */
    public function getUserAddresses(int $fanId): Collection
    {
        return $this->addressRepo->getByUserId($fanId);
    }

    /**
     * 2. 住所の新規作成
     * @param int $fanId
     * @param array $data
     * @return Address
     */
    public function createAddress(int $fanId, array $data)
    {
        // デフォルト設定がONの場合、既存のデフォルトをOFFにする
        if ($data['is_default'] ?? false) {
            $this->addressRepo->resetDefault($fanId);
        }

        $data['fan_id'] = $fanId;
        return $this->addressRepo->store($data);
    }

    /**
     * 3. 住所の削除
     * @param int $fanId
     * @param int $addressId
     * @return bool
     */
    public function deleteAddress(int $fanId, int $addressId): bool
    {
        $address = $this->addressRepo->findByIdAndUser($addressId, $fanId);

        if (!$address) {
            return false;
        }

        return $this->addressRepo->delete($addressId);
    }

    /**
     * 特定の住所を取得
     * @param int $userId
     * @param int $addressId
      * @return Address|null
     */
    public function getByIdAndUser(int $userId, int $addressId)
    {
        return $this->addressRepo->findByIdAndUser($addressId, $userId);
    }

    /**
     * 住所の更新
     * @param int $userId
     * @param int $addressId
     * @param array $data
     * @return bool
     */
    public function updateAddress(int $userId, int $addressId, array $data)
    {
        // 1. 本人の住所か確認
        $address = $this->addressRepo->findByIdAndUser($addressId, $userId);
        if (!$address) return false;

        // 2. 憲法：デフォルト設定の切り替え
        if (isset($data['is_default']) && $data['is_default'] == 1) {
            $this->addressRepo->resetDefault($userId);
        }

        return $this->addressRepo->update($addressId, $data);
}
}