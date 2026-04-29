<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use App\Models\User;
use App\Models\Product;
use App\Models\GroupOrder;
use App\Models\Review;
use App\Models\Follow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CreatorController extends Controller
{
    /**
     * クリエイター詳細画面
     */
    public function show(Creator $creator, Request $request)
    {
        // 1. Artworkの一覧（ページネーション対応）
        $artworks = Product::where('creator_id', $creator->id)
            ->with(['images', 'translations'])
            ->latest()
            ->paginate(12, ['*'], 'artwork_page') // パラメータ名を重複させない
            ->withQueryString();

        // 2. Group Orderの一覧（ページネーション対応）
        $groupOrders = GroupOrder::where('creator_id', $creator->id)
            ->with(['items.product.images'])
            ->withCount('participants')
            ->latest()
            ->paginate(8, ['*'], 'go_page')
            ->withQueryString()
            ->through(function ($go) {
                // 代表画像をセット
                $representativeImages = $go->items->first()?->product?->images ?? collect();
                $go->setRelation('images', $representativeImages);
                return $go;
            });

        // 3. フォロー状態の確認
        $isFollowing = auth()->check() 
            ? auth()->user()->following()->where('creator_id', $creator->id)->exists() 
            : false;

        return Inertia::render('Fan/Creator/Show', [
            'creator' => $creator->loadCount(['followers', 'products']),
            'artworks' => $artworks,
            'groupOrders' => $groupOrders,
            'isFollowing' => $isFollowing,
            'language' => $this->getTranslationData(),
            'filters' => $request->only(['tab']), // 現在のタブを保持用
        ]);
    }

    /**
     * フォロー / フォロー解除の切り替え
     */
    public function toggleFollow(Creator $creator)
    {
        $fan = Auth::user();

        if (!$fan) {
            return redirect()->route('login');
        }

        // fan_id を使用して既存のフォローを確認
        $follow = Follow::where('fan_id', $fan->id)
            ->where('creator_id', $creator->id)
            ->first();

        if ($follow) {
            $follow->delete();
            $message = 'Unfollowed successfully.';
        } else {
            Follow::create([
                'fan_id'     => $fan->id, // ご指摘通り fan_id を使用
                'creator_id' => $creator->id
            ]);
            $message = 'Following successfully!';
        }

        return back()->with('message', $message);
    }

    /**
     * レビューの投稿 (写真付き対応)
     */
    public function storeReview(Request $request, Product $product)
    {
        $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'comment'  => 'required|string|min:10',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // 2MB制限
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $imagePaths[] = $path;
            }
        }

        Review::create([
            'user_id'    => Auth::id(),
            'product_id' => $product->id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
            'images'     => $imagePaths, // JSON型に保存
        ]);

        return back()->with('success', 'Thank you for your review!');
    }
}