<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomesticShipping;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\Admin\InspectionService;
use App\Enums\DomesticShippingStatus;
use App\Models\GroupOrder;

class InspectionController extends Controller
{
    public function __construct(
        protected InspectionService $inspectionService
    ) {}

    /**
     * 検品・仕分けメイン端末画面の表示
     */
    public function index()
    {
        return Inertia::render('Admin/Inspection/Index', [
            'scannedGroupOrder' => session('scannedGroupOrder'),
            'status'            => session('status'),
            'error'             => session('error')
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

    /**
     * バーコードスキャン時の高速解析エンドポイント
     */
    public function scan(Request $request)
    {
        $request->validate([
            'barcode_raw' => 'required|string|max:100',
        ]);

        $barcode = trim($request->input('barcode_raw'));

        // バーコード文字列から数字（GOのプライマリーID）のみを安全に抽出
        // 例: 「GO-2026-0085」や納品ラベルのバーコードからID「85」を一本釣り
        preg_match('/\d+$/', $barcode, $matches);
        $goId = isset($matches[0]) ? (int)$matches[0] : (int)$barcode;

        // 該当する共同購入プランと、それにぶら下がる未検品の注文アイテム群を一括ロード
        $groupOrder = GroupOrder::with([
            'product.images',
            'product.variations',
            'orders' => function ($q) {
                $q->whereIn('status', ['paid', 'authorized', 'processing']);
            },
            'orders.orderItems',
            'creator'
        ])->find($goId);

        if (!$groupOrder) {
            return redirect()->route('admin.inspections.index')->with(
                'error', 
                "コード「{$barcode}」に該当する共同購入（GO）プランがシステム内に存在しません。バーコードの破損、または未発行の可能性があります。"
            );
        }

        // 該当GOのデータをセッションへフラッシュバインドしてインデックス画面へ高速リターン
        return redirect()->route('admin.inspections.index')->with([
            'scannedGroupOrder' => $groupOrder,
            'status'            => "【スキャン成功】 「{$groupOrder->title}」 の検品仕分けプランを自動起動しました。"
        ]);
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

    /**
     * 【新設】：海外ファン個別の検品・同梱完了アクション
     */
    public function completeOrderInspection(Request $request, $orderId)
    {
        try {
            $result = $this->inspectionService->processInspectionComplete((int)$orderId);
            
            // 現在スキャンしているGOプランの最新状態を再取得してリダイレクトバック（画面のリアルタイム更新）
            $goId = $request->input('group_order_id');
            $updatedGo = GroupOrder::with([
                'product.images',
                'orders' => function ($q) {
                    $q->with(['orderItems', 'shippingAddress', 'user']);
                },
                'creator'
            ])->find($goId);

            return redirect()->route('admin.inspections.index')->with([
                'scannedGroupOrder' => $updatedGo,
                'status'            => "【仕分け完了】 箱ID #{$orderId} の検品が完了。限定サンクスカードが倉庫プリンターから自動排紙されました！(デジタルアセット解放数: {$result['unlocked_count']})"
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', '検品完了処理の実行中にエラーが発生しました。');
        }
    }
}