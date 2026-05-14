<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Services\Fan\MypageService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class MypageController extends Controller
{
    protected $mypageService;

    public function __construct(MypageService $mypageService)
    {
        $this->mypageService = $mypageService;
    }

    /**
     * ダッシュボードの表示
     */
    public function dashboard(): Response
    {
        $fanId = Auth::id();
        
        // Service層から統計データを取得（憲法：ビジネスロジックの分離）
        $stats = $this->mypageService->getPurchaseStats($fanId);

        return Inertia::render('Fan/Mypage/Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * 主催したGroup Order一覧の表示
     * * 追加項目
     */
    public function groupOrders(): Response
    {
        $userId = Auth::id();
        
        // サービス層から主催データを取得
        $groupOrders = $this->mypageService->getOrganizedGroupOrders($userId);

        return Inertia::render('Fan/Mypage/GroupOrders', [
            'groupOrders' => $groupOrders
        ]);
    }

    /**
     * 
     * 主催したGroup Order詳細の表示
     */
    public function show(int $id): Response
    {
        $userId = Auth::id();
        $go = $this->mypageService->getOrganizedGroupOrderDetail($userId, $id);

        return Inertia::render('Fan/Mypage/GroupOrderDetail', [
            'go' => $go
        ]);
    }

    /**
     * 参加中のGroup Order一覧を取得
     */
    public function joinedGroupOrders(): Response
    {
        $fanId = Auth::id();
        $groupOrders = $this->mypageService->getJoinedGroupOrders($fanId);

        return Inertia::render('Fan/Mypage/JoinedGroupOrders', [
            'groupOrders' => $groupOrders,
        ]);
    }

    /**
     * 配送中の注文一覧
     */
    public function shippingOrders(): Response
    {
        $fanId = Auth::id();
        $orders = $this->mypageService->getShippingOrders($fanId);

        return Inertia::render('Fan/Mypage/ShippingOrders', [
            'orders' => $orders
        ]);
    }

    /**
     * 同梱待ちの注文一覧
     */
    public function consolidationOrders(): Response
    {
        $fanId = Auth::id();
        $orders = $this->mypageService->getConsolidationOrders($fanId);

        return Inertia::render('Fan/Mypage/ConsolidationOrders', [
            'orders' => $orders
        ]);
    }
}