<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // 検索やフィルタリングが必要な場合はここでクエリを構築
        $orders = Order::with(['fan', 'orderItems'])
            ->withCount('orderItems')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show($id)
    {
        // 注文詳細（以前仮置きしたリンクの遷移先）
        $order = Order::with([
            'fan',
            'orderItems.product.translations' => fn($q) => $q->where('locale', 'ja'),
            'orderItems.product.images',
            'orderItems.variation',
            'payment' // 紐づく決済情報
        ])->findOrFail($id);

        // dd($order);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }
}