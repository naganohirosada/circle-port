<?php
namespace App\Services\Fan;

use App\Repositories\Interfaces\FanRepositoryInterface;


class ProfileService {
    protected $fanRepo;

    public function __construct(FanRepositoryInterface $fanRepo) {
        $this->fanRepo = $fanRepo;
    }

    public function updateProfile(int $fanId, array $data): bool
    {
        // 憲法：保存先テーブルごとにデータを分離（カプセル化）
        $userData = [
            'name'  => $data['name'],
            'email' => $data['email'],
        ];

        $fanData = [
            'country_id'    => $data['country_id'],
            'language_id'   => $data['language_id'], // マスタIDを保存
            'currency_id' => $data['currency_id'],
            'timezone_id'      => $data['timezone_id'],
        ];

        return $this->fanRepo->updateProfile($fanId, $userData, $fanData);
    }

    /**
     * ファンのプロフィール情報を取得
     * @param int $fanId ファンID
     * @return array|null 連想配列でユーザ情報とファン情報を返す（存在しない場合はnull）
     */
    public function getFanProfile(int $fanId)
    {
        return $this->fanRepo->getProfile($fanId);
    }
}