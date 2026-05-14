<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\HsCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::with(['translations', 'defaultHsCode', 'subCategories.translations', 'subCategories.defaultHsCode'])->get(),
            'hsCodes' => HsCode::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'translations' => 'required|array',
            'translations.*.locale' => 'required|string',
            'translations.*.name' => 'required|string',
            'default_hs_code_id' => 'nullable|exists:hs_codes,id',
        ]);

        $category = Category::create([
            'default_hs_code_id' => $data['default_hs_code_id']
        ]);

        foreach ($data['translations'] as $trans) {
            $category->translations()->create($trans);
        }

        return redirect()->back()->with('success', 'カテゴリを作成しました。');
    }

    public function update(Request $request, Category $category)
    {
        // 更新処理（storeと同様のロジック）
    }
}