<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * クリエイター専用ダッシュボード（Studio）の表示
     * * @return \Inertia\Response
     */
    public function index(): Response
    {
        $creator = auth()->guard('creator')->user();

        return Inertia::render('Creator/Dashboard', [
            'stats' => [
                'total_sales' => 0,
                'active_projects' => 0,
                'unread_messages' => 0,
            ],
            'shop_name' => $creator->shop_name,
        ]);
    }
}