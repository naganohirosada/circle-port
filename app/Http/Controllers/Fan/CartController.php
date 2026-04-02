<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\Cart\AddToCartRequest;
use App\Http\Requests\Fan\Cart\UpdateCartRequest;
use App\Services\Fan\CartService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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
        // 憲法第3条：ファンガードから現在のユーザーを取得
        $fan = Auth::guard('fan')->user();
        $locale = app()->getLocale();

        return Inertia::render('Fan/Cart/Index', [
            // カートの中身（既存のロジック）
            'cart' => $this->cartService->getCartDetails($locale),

            // 1. 登録済みの配送先一覧
            'shippingAddresses' => $fan->shippingAddresses()
                ->latest()
                ->get()
                ->map(function ($address) {
                    return [
                        'id' => $address->id,
                        'label' => $address->name, // 「自宅」「実家」などのラベル
                        'postal_code' => $address->postal_code,
                        'country_name' => $address->country->name, // 憲法第2条：国マスタのリレーション
                        'address_line1' => $address->address_line1,
                        'address_line2' => $address->address_line2,
                    ];
                }),

            // 2. 登録済みの決済方法（カード情報）一覧
            'paymentMethods' => $fan->paymentMethods()
                ->latest()
                ->get()
                ->map(function ($pm) {
                    return [
                        'id' => $pm->id,
                        'brand' => $pm->brand,       // Visa, Mastercard 等
                        'last4' => $pm->last4,       // 下4桁
                        'exp_month' => $pm->exp_month,
                        'exp_year' => $pm->exp_year,
                    ];
                }),
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