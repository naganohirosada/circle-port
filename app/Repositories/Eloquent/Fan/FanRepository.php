<?php
namespace App\Repositories\Eloquent\Fan;

use App\Models\Fan;
use App\Repositories\Interfaces\AuthRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class FanRepository implements AuthRepositoryInterface
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
}