<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\CheckoutRequest;
use App\Services\Checkout\CheckoutService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Order; // 追加

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
            // GO注文かどうかを判定（カートデータにgroup_order_idがある場合）
            $cartData = $request->input('cart_data', []);
            $tips = $request->input('tips', []);
            $isGoOrder = !empty(array_filter($cartData, fn($item) => isset($item['group_order_id']) && !empty($item['group_order_id'])));

            // 憲法第1条 & 第3条：複雑な注文・決済フローは Service に集約
            $order = $this->checkoutService->execute(
                Auth::guard('fan')->user(),
                $cartData,
                $request->input('payment_method_id'),
                $request->input('shipping_address_id'),
                $request->input('selected_cart_keys'),
                $isGoOrder, // GO注文フラグを追加
                $tips
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
        $order = Order::with(['orderItems.product.translations', 'payment.breakdowns'])
            ->findOrFail($orderId);

        // 料金内訳の計算
        $breakdowns = $order->payment->breakdowns ?? collect();
        $feeBreakdown = [
            'item_total' => $breakdowns->where('type', 1)->sum('amount'), // 商品代金合計
            'item_tax' => $breakdowns->where('type', 5)->sum('amount'), // 商品消費税
            'shipping' => $breakdowns->whereIn('type', [2, 3])->sum('amount'), // 送料
            'shipping_tax' => $breakdowns->where('type', 7)->sum('amount'), // 送料消費税
            'fee' => $breakdowns->where('type', 4)->sum('amount'), // システム手数料
            'total' => $order->total_amount,
        ];

        return Inertia::render('Fan/Checkout/Success', [
            'order' => $order,
            'fee_breakdown' => $feeBreakdown,
        ]);
    }
}