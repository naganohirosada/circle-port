<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 決済完了(20)のレコードを対象
        $payments = DB::table('payments')->where('status', PaymentStatus::SUCCEEDED);

        $totalGross = $payments->sum('total_amount');
        $stripeFee = floor($totalGross * 0.036);
        $platformProfit = floor($totalGross * 0.10); // システム手数料10%想定
        $creatorPayout = $totalGross - ($stripeFee + $platformProfit);

        return \Inertia\Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalGross' => $totalGross,
                'stripeFee' => $stripeFee,
                'platformProfit' => $platformProfit,
                'creatorPayout' => $creatorPayout,
            ]
        ]);
    }
}