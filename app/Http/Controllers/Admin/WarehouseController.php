<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Admin\WarehouseRequest;

class WarehouseController extends Controller
{
    /**
     * 倉庫一覧
     */
    public function index()
    {
        return Inertia::render('Admin/Warehouse/Index', [
            'warehouses' => Warehouse::orderBy('id', 'desc')->get(),
            'success' => session('success'),
        ]);
    }

    /**
     * 新規登録画面
     */
    public function create()
    {
        return Inertia::render('Admin/Warehouse/Create');
    }

    /**
     * 新規保存
     */
    public function store(WarehouseRequest $request)
    {
        // バリデーション済みのデータを取得
        $validated = $request->validated();

        Warehouse::create($validated);

        return redirect()->route('admin.warehouses.index')
            ->with('success', '新しい倉庫を登録しました。');
    }

    /**
     * 編集画面
     */
    public function edit(Warehouse $warehouse)
    {
        return Inertia::render('Admin/Warehouse/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * 更新処理
     */
    public function update(
        WarehouseRequest $request,
        Warehouse $warehouse
    ) {
        // バリデーション済みのデータを取得
        $validated = $request->validated();

        $warehouse->update($validated);

        return redirect()->route('admin.warehouses.index')
            ->with('success', '倉庫情報を更新しました。');
    }

    /**
     * 削除処理
     */
    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return redirect()->route('admin.warehouses.index')
            ->with('success', '倉庫を削除しました。');
    }
}