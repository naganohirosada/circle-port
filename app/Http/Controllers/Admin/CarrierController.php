<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Carrier;
use App\Http\Requests\Admin\CarrierRequest;
use Inertia\Inertia;

class CarrierController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Carrier/Index', [
            'carriers' => Carrier::orderBy('id', 'asc')->get(),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Carrier/Create');
    }

    public function store(CarrierRequest $request)
    {
        Carrier::create($request->validated());

        return redirect()->route('admin.carriers.index')
            ->with('success', '配送業者を登録しました。');
    }

    public function edit(Carrier $carrier)
    {
        return Inertia::render('Admin/Carrier/Edit', [
            'carrier' => $carrier,
        ]);
    }

    public function update(CarrierRequest $request, Carrier $carrier)
    {
        $carrier->update($request->validated());

        return redirect()->route('admin.carriers.index')
            ->with('success', '配送業者情報を更新しました。');
    }

    public function destroy(Carrier $carrier)
    {
        $carrier->delete();

        return redirect()->route('admin.carriers.index')
            ->with('success', '配送業者を削除しました。');
    }
}