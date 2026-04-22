<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Enums\InternationalShippingStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InternationalShippingController extends Controller
{
    public function __construct(
        protected InternationalShippingRepositoryInterface $intlRepo
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

        // ステータスを「送料支払い待ち(30)」へ更新
        $this->intlRepo->update((int)$id, array_merge($validated, [
            'status' => InternationalShippingStatus::WAITING_PAYMENT->value
        ]));

        return redirect()->route('admin.international-shippings.index')
            ->with('success', "配送 #{$id} の梱包・計量が完了し、送料が確定しました。");
    }
}