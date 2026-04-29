<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * 自分の商品に届いたレビュー一覧
     */
    public function index()
    {
        // クリエイター（ガードは creator を想定）
        $creatorId = Auth::guard('creator')->id();

        $reviews = Review::whereHas('product', function ($query) use ($creatorId) {
            $query->where('creator_id', $creatorId);
        })
        ->with([
            'product.translations', // 商品名表示用
            'product.images',
            'fan',                  // 投稿者情報
            'images',               // 投稿写真
            'translations'          // 日本語翻訳データ
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('Creator/Reviews/Index', [
            'reviews' => $reviews
        ]);
    }
}