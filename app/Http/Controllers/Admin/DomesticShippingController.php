<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\DomesticShipping;
use Inertia\Inertia;

class DomesticShippingController extends Controller
{
    public function index()
    {
        // クリエイターからの国内配送情報を取得
        $shippings = DomesticShipping::with([
            'order.fan', // どの注文の誰宛か
            'items.orderItem.product' // 何が入っているか
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return Inertia::render('Admin/DomesticShipping/Index', [
            'shippings' => $shippings,
        ]);
    }

    public function show($id)
    {
        $shipping = DomesticShipping::with([
            'order.fan',
            'items.product',
            'items.product.images',
            'items.product.translations' => fn($q) => $q->where('locale', 'ja'),
            'items.orderItem.product.translations' => fn($q) => $q->where('locale', 'ja'),
            'items.orderItem.product.images',
            'items.orderItem.variation',
            'items.variation.translations' => fn($q) => $q->where('locale', 'ja'),
        ])->findOrFail($id);

        return Inertia::render('Admin/DomesticShipping/Show', [
            'shipping' => $shipping,
        ]);
    }
}