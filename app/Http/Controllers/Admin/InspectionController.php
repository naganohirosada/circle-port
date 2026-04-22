<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomesticShipping;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\Admin\InspectionService;
use App\Enums\DomesticShippingStatus;

class InspectionController extends Controller
{
    public function __construct(
        protected InspectionService $inspectionService
    ) {}

    public function index()
    {
        $shippings = DomesticShipping::whereIn('status', [
                DomesticShippingStatus::SHIPPED->value,  // 20: 発送済み
                DomesticShippingStatus::RECEIVED->value  // 30: 受領・検品済み
            ])
            ->with(['creator', 'warehouse', 'carrier'])
            ->withCount('items') // Index.jsx で使う「アイテム種類数」を取得
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Inspection/Index', [
            'shippings' => $shippings
        ]);
    }

    public function show(DomesticShipping $domesticShipping)
    {
        $domesticShipping->load([
            'creator',
            'warehouse',
            'carrier',
            'items.product.translations',
            'items.product.images',
            'items.variation.translations', 
            'order', 
            'groupOrder'
        ]);
        return Inertia::render('Admin/Inspection/Show', [
            'shipping' => $domesticShipping
        ]);
    }

    public function scan(Request $request)
    {
        $number = $request->query('number');
        $shipping = DomesticShipping::where('domestic_shipping_number', $number)->first();

        if (!$shipping) {
            return back()->withErrors(['scan' => '該当する配送データが見つかりません。']);
        }

        // 該当する検品詳細画面へリダイレクト
        return redirect()->route('admin.inspections.show', $shipping->id);
    }

    /**
     * 検品完了処理：国内配送を完了し、国際配送データを作成/紐付けする
     */
    public function complete($id)
    {
        try {
            $this->inspectionService->completeInspection((int)$id);
            return redirect()->route('admin.inspections.index')
                ->with('success', "配送 #{$id} の検品と国際配送への振り分けが完了しました。");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => '検品処理に失敗しました：' . $e->getMessage()]);
        }
    }
}