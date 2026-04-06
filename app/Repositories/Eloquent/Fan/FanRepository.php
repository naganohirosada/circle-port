<?php
namespace App\Repositories\Eloquent\Fan;

use App\Models\Fan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\FanRepositoryInterface;

class FanRepository implements FanRepositoryInterface
{
    /**
     * 新規ファン登録
     * @param array $data
     * @return Fan
     */
    public function create(array $data)
    {
        return Fan::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'country_id' => $data['country_id'],
            'status' => Fan::STATUS_ACTIVE,
            'unique_id' => $data['unique_id'],
        ]);
    }

    /**
     * メールアドレスでファンを検索
     * @param string $email
     * @return Fan|null
     */
    public function findByEmail(string $email)
    {
        return Fan::where('email', $email)->first();
    }

    /**
     * ファンのプロフィール更新
     * @param int $fanId
     * @param array $userData (name, email)
     * @param array $fanData (country_id, lang, etc.)
     * @return bool
     */
    public function updateProfile(int $fanId, array $userData, array $fanData): bool
    {
        // 憲法：Eager Loading で N+1 を防ぎつつ取得
        $fan = Fan::findOrFail($fanId);
        
        // トランザクションを推奨（どちらか失敗したらロールバック）
        return DB::transaction(function () use ($fan, $userData, $fanData) {
            $fan->update($userData);
            return $fan->update($fanData);
        });
    }

    /**
     * プロフィール情報を関連モデル（User, Country, Language）込みで取得
     * @param int $fanId
     * @return Fan|null
     */
    public function getProfile(int $fanId): ?Fan
    {
        return Fan::with(['user', 'country', 'language'])
            ->where('id', $fanId)
            ->first();
    }
}