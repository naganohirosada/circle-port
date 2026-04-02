<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\CheckoutRequest;
use App\Services\Checkout\CheckoutService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * 注文確定処理
     * @param $request
     */
    public function store(CheckoutRequest $request)
    {

        try {
            // 憲法第1条 & 第3条：複雑な注文・決済フローは Service に集約
            $order = $this->checkoutService->execute(
                Auth::guard('fan')->user(),
                $request->input('cart_data'),
                $request->input('payment_method_id'),
                $request->input('shipping_address_id'),
                $request->input('selected_cart_keys'),
            );

            // 成功：注文完了画面へ（多言語メッセージを添えて）
            return redirect()->route('fan.checkout.success', ['order' => $order->id])
                            ->with('message', __('Order completed successfully!'));

        } catch (\Exception $e) {
            // 失敗：エラーメッセージと共にカートへ戻す
            return back()->withErrors(['checkout_error' => $e->getMessage()]);
        }
    }

    /**
     * 注文完了画面
     * @param int $orderId
     */
    public function success($orderId)
    {
        return Inertia::render('Fan/Checkout/Success', [
            'order_id' => $orderId
        ]);
    }
}