<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\Fan\OrderService;

class OrderController extends Controller
{

    protected $orderService;

    public function __construct(OrderService $orderService) {
        $this->orderService = $orderService;
    }

    /**
     * 注文履歴
     */
    public function index()
    {
        $fan = Auth::guard('fan')->user();
        
        // 憲法第1条：サービスに丸投げして、加工済みの綺麗なデータを取得
        $orders = $this->orderService->getOrderHistory($fan);

        return Inertia::render('Fan/Order/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * 注文詳細
     */
    public function show(Order $order)
    {
        // 憲法第1条：自分の注文かチェック
        if ($order->fan_id !== Auth::guard('fan')->id()) {
            abort(403);
        }

        $fan = Auth::guard('fan')->user();

        // 必要なリレーションをロード
        $order->load([
            'orderItems.product.translations',
            'orderItems.product.images',
            'orderItems.variation.translations',
            'shippingAddress.country.translations',
            'payment.breakdowns',
            'paymentMethod'
        ]);

        // Serviceで表示用に加工
        $formattedOrder = $this->orderService->formatOrder($order, $fan->language_code);
        return Inertia::render('Fan/Order/Show', [
            'order' => $formattedOrder
        ]);
    }

    public function retryPayment(Order $order)
    {
        // 自分の注文かチェック
        if ($order->fan_id !== auth()->id()) abort(403);

        try {
            $primaryCard = auth()->user()->paymentMethods()->where('is_primary', 1)->first();

            if (!$primaryCard) {
                return back()->withErrors(['error' => __('Please register a primary payment method first.')]);
            }

            // Stripe決済実行（バッチと同じサービスメソッドを利用）
            $intent = app(\App\Services\Common\StripeService::class)->captureSavedCardPayment($order, $primaryCard);

            if ($intent->status === 'succeeded') {
                $order->update(['payment_status' => 'paid']);
                return back()->with('success', __('Payment completed successfully!'));
            }

        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Payment failed again. Please try another card.')]);
        }
    }
}