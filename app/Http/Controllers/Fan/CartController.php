<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\Cart\AddToCartRequest;
use App\Http\Requests\Fan\Cart\UpdateCartRequest;
use App\Services\Fan\CartService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     *  カート内容の表示（翻訳データと関税準備を含む）
     * @return \Inertia\Response
     * 
     */
    public function index()
    {
        $locale = app()->getLocale();
        $cartData = $this->cartService->getCartDetails($locale);

        return Inertia::render('Fan/Cart/Index', [
            'cart' => $cartData,
        ]);
    }

    /**
     * カートに商品を追加
     * @param AddToCartRequest $request
     * @return RedirectResponse
     */
    public function add(AddToCartRequest $request): RedirectResponse
    {
        $this->cartService->addItem(
            $request->product_id,
            $request->variation_id,
            $request->quantity
        );

        return redirect()->back()->with('success', 'Added to Cart');
    }

    /**
     * カートから商品を削除
     * * @param string $cartKey
     * @return RedirectResponse
     */
    public function remove(string $cartKey): RedirectResponse
    {
        // Service 層に削除処理を依頼
        $this->cartService->removeItem($cartKey);

        // 前のページ（カート一覧）に戻る
        return redirect()->back()->with('success', 'Removed from cart');
    }

    /**
     * 数量更新も未実装であれば、ここに追加しておきましょう
     */
    public function update(UpdateCartRequest $request, string $cartKey): RedirectResponse
    {
        $this->cartService->updateItem($cartKey, $request->quantity);

        return redirect()->back()->with('success', 'Cart updated');
    }
}