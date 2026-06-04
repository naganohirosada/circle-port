<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Enums\InternationalShippingStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\Admin\InternationalShippingService;

class InternationalShippingController extends Controller
{
    public function __construct(
        protected InternationalShippingRepositoryInterface $intlRepo,
        protected InternationalShippingService $shippingService
    ) {}

    /**
     * 国際配送一覧（梱包待ち・支払い待ちなど）
     */
    public function index()
    {
        $shippings = $this->intlRepo->paginateByStatus([
            InternationalShippingStatus::PENDING->value,
            InternationalShippingStatus::PACKING->value,
            InternationalShippingStatus::WAITING_PAYMENT->value,
        ]);

        return Inertia::render('Admin/InternationalShipping/Index', [
            'shippings' => $shippings
        ]);
    }

    /**
     * 梱包・計量画面（ワークベンチ）
     */
    public function show($id)
    {
        $shipping = $this->intlRepo->findByIdWithDetails((int)$id);

        return Inertia::render('Admin/InternationalShipping/Show', [
            'shipping' => $shipping
        ]);
    }

    /**
     * 計量・送料確定処理
     */
    public function updatePacking(Request $request, $id)
    {
        $validated = $request->validate([
            'total_weight' => 'required|numeric|min:0',
            'dimensions'   => 'required|array',
            'dimensions.length' => 'required|numeric',
            'dimensions.width'  => 'required|numeric',
            'dimensions.height' => 'required|numeric',
            'shipping_fee' => 'required|integer|min:0',
            'carrier_id'   => 'nullable|exists:carriers,id',
        ]);

        try {
            // リポジトリの新しいメソッドを呼び出し、一括でレコード作成
            $this->intlRepo->confirmPackingAndFee((int)$id, $validated);

            return redirect()->route('admin.international-shippings.index')
                ->with('success', "配送 #{$id} の梱包完了と送料確定、および決済予約レコードの作成が完了しました。");

        } catch (\Exception $e) {
            Log::error("送料確定エラー: " . $e->getMessage());
            return back()->withErrors(['error' => '送料確定処理に失敗しました。']);
        }
    }

    /**
     * ワンクリック・国際キャリアAPI連携（配送ラベル・免税インボイスPDF全自動発行）
     */
    public function processLabelGeneration(Request $request, $id)
    {
        try {
            $result = $this->shippingService->generateLabelAndInvoice((int)$id);

            return redirect()->route('admin.international-shippings.index')->with(
                'status',
                "【国際出荷手続き完了】 追跡番号「{$result['tracking_number']}」をDHL/FedExから取得。通関インボイスおよび配送送り状PDF（全{$result['item_count']}品目）を全自動生成し、ファンへ追跡番号を解放通知しました！"
            );

        } catch (\Exception $e) {
            return redirect()->route('admin.international-shippings.index')->with(
                'error',
                "国際物流キャリアとのAPI連携通信に失敗しました。理由: " . $e->getMessage()
            );
        }
    }
}