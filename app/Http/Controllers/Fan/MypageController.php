<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Services\Fan\MypageService;
use Inertia\Inertia;
use Inertia\Response;

class MypageController extends Controller
{
    protected $mypageService;

    public function __construct(MypageService $mypageService)
    {
        $this->mypageService = $mypageService;
    }

    /**
     * Buyee風ダッシュボードの表示
     */
    public function dashboard(): Response
    {
        $userId = auth()->id();
        
        // Service層から統計データを取得（憲法：ビジネスロジックの分離）
        $stats = $this->mypageService->getPurchaseStats($userId);

        return Inertia::render('Fan/Mypage/Dashboard', [
            'stats' => $stats
        ]);
    }
}