<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\InternationalShipping;
use Illuminate\Support\Facades\Auth;
use App\Enums\InternationalShippingStatus;
use Inertia\Inertia;
use App\Services\Fan\InternationalShippingService;

class InternationalShippingController extends Controller
{
    public function __construct(
        protected InternationalShippingService $shippingService
    ) {}

    public function index()
    {
        // サービスからデータを取得
        $shippings = $this->shippingService->getShippingListForFan(auth()->user());

        return Inertia::render('Fan/InternationalShipping/Index', [
            'shippings' => $shippings
        ]);
    }

    public function createShippingCheckoutSession(int $id)
    {
        // 即時決済成功URL、またはStripe入力画面URLのいずれかが返ってくる
        $url = $this->shippingService->createCheckoutSession($id, auth()->id());
        
        return response()->json(['url' => $url]);
    }

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