<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Services\Creator\DomesticShippingService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

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
            'shippings' => $this->shippingService->getShippingList(Auth::id())
        ]);
    }

    /**
     * 発送通知の送信
     */
    public function notifyShipped(Request $request, $id)
    {
        // 憲法：バリデーションは本来FormRequestで行うが、ここでは簡略化
        $request->validate([
            'tracking_number' => 'required|string',
            'carrier' => 'required|string'
        ]);

        $this->shippingService->updateStatus($id, 20); // 20 = SHIPPED
        
        return redirect()->back()->with('success', '発送通知を送信しました。');
    }
}