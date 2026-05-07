<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\InternationalShipping;
use Illuminate\Support\Facades\Auth;
use App\Enums\InternationalShippingStatus;
use Inertia\Inertia;
use App\Services\Fan\InternationalShippingService;
use Illuminate\Http\Request; // 追加

class InternationalShippingController extends Controller
{
    public function __construct(
        protected InternationalShippingService $shippingService
    ) {}

    public function index()
    {
        $fan = auth()->user();

        // 1. 既存の配送リスト（支払い待ち、配送中など）
        $shippings = $this->shippingService->getShippingListForFan($fan);

        // 2. 【追加】同梱（まとめ配送）依頼が可能な注文リスト
        $availableOrders = $this->shippingService->getConsolidatableOrders($fan->id);

        return Inertia::render('Fan/InternationalShipping/Index', [
            'shippings' => $shippings,
            'availableOrders' => $availableOrders // フロントエンドに渡す
        ]);
    }

    /**
     * 【追加】同梱配送（まとめ配送）の依頼実行
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id'
        ]);

        try {
            $shipping = $this->shippingService->requestConsolidation(
                auth()->id(),
                $request->order_ids
            );

            return redirect()->route('fan.international-shippings.index')
                ->with('success', '同梱配送（まとめ配送）の依頼を作成しました。倉庫スタッフによる重量確認・送料見積もりをお待ちください。');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * 送料の支払いセッション作成
     */
    public function createShippingCheckoutSession(int $id)
    {
        // 即時決済成功URL、またはStripe入力画面URLのいずれかが返ってくる
        $url = $this->shippingService->createCheckoutSession($id, auth()->id());
        
        return response()->json(['url' => $url]);
    }

    /**
     * 支払い完了画面
     */
    public function paymentSuccess($id)
    {
        $shipping = InternationalShipping::where('fan_id', auth()->id())
            ->with(['carrier'])
            ->findOrFail($id);

        return Inertia::render('Fan/InternationalShipping/Success', [
            'shipping' => $shipping
        ]);
    }
}