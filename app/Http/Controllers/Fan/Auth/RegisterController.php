<?php
namespace App\Http\Controllers\Fan\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\RegisterRequest;
use App\Services\Fan\FanAuthService;
use App\Models\Country;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    protected $authService;

    public function __construct(FanAuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * 登録画面の表示 (Inertia版)
     */
    public function showRegistrationForm(): Response
    {
        // アクティブな国リストを取得してReact側へ渡す
        $countries = Country::where('status', 1)
            ->select('id', 'name_en', 'iso_code') // 必要なデータだけに絞ると転送が軽くなります
            ->get();

        return Inertia::render('Fan/Auth/Register', [
            'countries' => $countries
        ]);
    }

    /**
     * 登録処理の実行
     */
    public function register(RegisterRequest $request)
    {
        // Service側で Fan::create & Auth::guard('fan')->login() が実行される想定
        $this->authService->register($request->validated());

        // Inertiaの推奨に従い、リダイレクト
        return redirect()->route('fan.dashboard');
    }
}