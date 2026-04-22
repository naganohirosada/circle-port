<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\CarrierRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarrierController extends Controller
{
    public function __construct(
        protected CarrierRepositoryInterface $carrierRepo
    ) {}

    public function index()
    {
        return Inertia::render('Admin/Carrier/Index', [
            'carriers' => $this->carrierRepo->all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tracking_url_pattern' => 'nullable|string|max:500',
            'is_active' => 'required|boolean',
        ]);

        $this->carrierRepo->create($validated);

        return redirect()->route('admin.carriers.index')->with('success', '業者を追加しました。');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tracking_url_pattern' => 'nullable|string|max:500',
            'is_active' => 'required|boolean',
        ]);

        $this->carrierRepo->update((int)$id, $validated);

        return redirect()->route('admin.carriers.index')->with('success', '業者情報を更新しました。');
    }
}