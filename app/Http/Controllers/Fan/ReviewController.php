<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\StoreReviewRequest;
use App\Services\Fan\ReviewService;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    protected $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    public function store(StoreReviewRequest $request, $productId)
    {
        try {
            $this->reviewService->storeReview(
                $productId, 
                Auth::id(), 
                $request->all()
            );

            return back()->with('message', 'レビューを投稿しました。ありがとうございます！');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'レビューの投稿に失敗しました。']);
        }
    }
}