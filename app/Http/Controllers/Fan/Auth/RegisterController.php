<?php
namespace App\Http\Controllers\Fan\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\RegisterRequest;
use App\Services\Fan\FanAuthService;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\CountryService; 

class RegisterController extends Controller
{
    protected $authService;
    protected $countryService;

    public function __construct(
        FanAuthService $authService,
        CountryService $countryService
    ) {
        $this->authService = $authService;
        $this->countryService = $countryService;
    }

    /**
     * 登録画面の表示 (Inertia版)
     */
    public function showRegistrationForm(): Response
    {
        return Inertia::render('Fan/Auth/Register', [
            'countries' => $this->countryService->getCountriesForRegistration()
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
        return redirect()->route('fan.mypage.dashboard');
    }
}