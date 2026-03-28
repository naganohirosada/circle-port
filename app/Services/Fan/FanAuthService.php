<?php

namespace App\Services\Fan;

use App\Repositories\Eloquent\Fan\FanRepository;
use Illuminate\Support\Facades\Auth;

class FanAuthService
{
    protected $repository;

    public function __construct(FanRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * ファン登録と同時にログインさせる
     * @param array $data
     * @return \App\Models\Fan
     */
    public function register(array $data)
    {
        // 登録処理
        $fan = $this->repository->create($data);

        // ログインさせる
        Auth::guard('fan')->login($fan);

        return $fan;
    }
}