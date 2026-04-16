<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Services\Creator\DomesticShippingService;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Creator\StoreDomesticShippingRequest;
use App\Models\Warehouse;
use App\Models\Carrier;
use App\Http\Requests\Creator\UpdateShippingNotificationRequest;
use App\Http\Requests\Creator\ShipDomesticShippingRequest;

class DomesticShippingController extends Controller
{
    protected $shippingService;

    public function __construct(DomesticShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    public function index()
    {
        $creatorId = auth()->id();
        return Inertia::render('Creator/Shipping/Index', [
            'shippings' => $this->shippingService->getCreatorShippings($creatorId),
        ]);
    }

    /**
     * 発送通知の送信
     */
    public function notify(UpdateShippingNotificationRequest $request, $id)
    {
        try {
            $this->shippingService->notifyShipping(
                (int)$id, 
                Auth::id(), 
                $request->validated()
            );

            return redirect()
                ->route('creator.shipping.index')
                ->with('success', '発送通知を送信しました。倉庫での受領をお待ちください。');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * 通常注文の配送登録画面
     */
    public function createRegular()
    {
        $creatorId = auth()->id();
        
        return Inertia::render('Creator/Shipping/CreateRegular', [
            'pendingItems' => $this->shippingService->getPendingRegularOrderItems($creatorId),
            'warehouses' => Warehouse::all(),
            'carriers' => Carrier::all(),
        ]);
    }

    /**
     * GO注文の配送登録画面
     */
    public function createGo()
    {
        $creatorId = auth()->id();

        return Inertia::render('Creator/Shipping/CreateGo', [
            'pendingGoOrders' => $this->shippingService->getPendingGoOrders($creatorId),
            'warehouses' => Warehouse::all(),
            'carriers' => Carrier::all(),
        ]);
    }

    /**
     * 配送登録の実行
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:regular,go',
            'warehouse_id' => 'required|exists:warehouses,id',
            'carrier_id' => 'required|exists:carriers,id',
            'tracking_number' => 'nullable|string|max:255',
            'shipping_date' => 'required|date',
            'items' => 'required|array|min:1',
        ]);

        $this->shippingService->createDomesticShipping($validated, auth()->id());

        return redirect()->route('creator.shipping.index')
            ->with('success', '国内配送を登録しました。');
    }

    /**
     * 配送詳細・パッキングリスト画面
     */
    public function show($id)
    {
        $shipping = $this->shippingService->getShippingDetail((int)$id, Auth::id());
        $carriers = Carrier::where('is_active', true)->get(); // 追加
        return Inertia::render('Creator/Shipping/Show', [
            'shipping' => $shipping,
            'carriers' => $carriers
        ]);
    }

    /**
     * 【新規追加】一括出荷処理
     * 憲法：バリデーション後にサービス層へ委譲
     */
    public function ship(ShipDomesticShippingRequest $request)
    {
        $validated = $request->validated();

        $count = $this->shippingService->ship($validated['ids']);

        return redirect()
            ->route('creator.shipping.index')
            ->with('success', "{$count}件の出荷処理を完了し、支援者へ通知しました。");
    }
}