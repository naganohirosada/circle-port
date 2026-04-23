<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FanController extends Controller
{
    public function index()
    {
        // 累計注文数と累計利用金額を計算して取得
        $fans = Fan::withCount('orders')
            ->withSum('orders', 'total_amount')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Fans/Index', [
            'fans' => $fans,
        ]);
    }

    public function show($id)
    {
        // プロフィール、配送先住所、注文履歴をロード
        $fan = Fan::with([
            'orders' => fn($q) => $q->orderBy('created_at', 'desc')->limit(10),
            'shippingAddresses' // 登録済みの住所
        ])->withCount('orders')
          ->withSum('orders', 'total_amount')
          ->findOrFail($id);

        return Inertia::render('Admin/Fans/Show', [
            'fan' => $fan,
        ]);
    }
}