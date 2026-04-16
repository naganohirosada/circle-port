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

class DomesticShippingController extends Controller
{
    protected $shippingService;

    public function __construct(DomesticShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    public function index()
    {
        return Inertia::render('Creator/Shipping/Index', [
            'shippings' => $this->shippingService->getShippingList(Auth::id()),
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

    public function create()
    {
        // 配送登録に必要な商品情報をリポジトリから取得
        $products = $this->shippingService->getDeliverableProducts(Auth::id());
        $warehouses = Warehouse::where('is_active', true)->get();
        return Inertia::render('Creator/Shipping/Create', [
            'products' => $products,
            'warehouses' => $warehouses
        ]);
    }

    public function store(StoreDomesticShippingRequest $request)
    {
        $validated = $request->validated();

        $this->shippingService->createShipping(Auth::id(), $validated['items']);

        return redirect()
            ->route('creator.shipping.index')
            ->with('success', '配送プランを登録しました。');
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
}