<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Creator; // クリエイターがUserモデルの場合
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreatorController extends Controller
{
    public function index()
    {
        $creators = Creator::withCount(['products', 'orderItems'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Creators/Index', [
            'creators' => $creators,
        ]);
    }

    public function show($id)
    {
        // クリエイター情報と、商品数・販売済アイテム数をカウント
        $creator = Creator::withCount(['products', 'orderItems'])
            ->with([
                'products' => function($query) {
                    $query->with(['translations' => fn($q) => $q->where('locale', 'ja'), 'images'])
                        ->latest()
                        ->limit(10); // 直近10件の商品を表示
                }
            ])
            ->findOrFail($id);

        return Inertia::render('Admin/Creators/Show', [
            'creator' => $creator,
        ]);
    }
}