<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\Fan\OrderService;
use Illuminate\Support\Facades\Storage;
use App\Models\GroupOrder;

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
                $order->update(['payment_status' => GroupOrder::PAYMENT_STATUS_COMPLETED]);
                return back()->with('success', __('Payment completed successfully!'));
            }

        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Payment failed again. Please try another card.')]);
        }
    }

    /**
     * デジタル商品のダウンロード
     * @param Order $order
     * @param int $itemId 注文アイテムID
     */
    public function downloadDigitalItem(Order $order, $itemId)
    {
        // 憲法第1条：自分の注文かチェック
        if ($order->fan_id !== Auth::guard('fan')->id()) abort(403);

        // 支払い済み（STATUS_PAID = 20）以上かチェック
        if ($order->status < Order::STATUS_PAID) {
            return back()->withErrors(['error' => __('Payment is not completed yet.')]);
        }

        // 注文アイテムの取得
        $item = $order->orderItems()->with(['product', 'variation'])->findOrFail($itemId);
        $product = $item->product;
        $variant = $item->variation;

        // ファイルパスの決定（バリエーション優先、なければ商品直下）
        $path = $variant?->digital_file_path ?: $product?->digital_file_path;

        if (!$path || !Storage::exists($path)) {
            abort(404, __('Digital file not found.'));
        }

        // 元のファイル名を取得（保存時のパスからファイル名を推測、または extension を維持）
        $fileName = $product->translations()->where('locale', 'ja')->first()?->name ?? 'download_file';
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        return Storage::download($path, "{$fileName}.{$extension}");
    }
}