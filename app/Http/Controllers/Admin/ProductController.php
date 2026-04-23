<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        // 承認待ち(5)を最上位に、次に公開中(2)を表示
        $products = Product::with(['creator', 'translations' => fn($q) => $q->where('locale', 'ja')])
            ->orderByRaw("FIELD(status, 5, 6, 2, 1, 3, 9)") 
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function show($id)
    {
        $product = Product::with([
            'creator',
            'translations' => fn($q) => $q->where('locale', 'ja'),
            'images',
            'variations.translations' => fn($q) => $q->where('locale', 'ja'),
        ])->findOrFail($id);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    public function updateStatus(Request $request, Product $product)
    {
        $request->validate([
            'status' => 'required|in:2,6', // 2:承認(公開), 6:却下(差し戻し)
            'reason' => 'required_if:status,6|nullable|string',
        ]);

        $product->update([
            'status' => $request->status,
            'rejection_reason' => $request->status == 6 ? $request->reason : null,
            'published_at' => $request->status == 2 ? now() : $product->published_at,
        ]);

        $msg = $request->status == 2 ? '商品を承認し、公開しました。' : '商品を却下し、クリエイターへ差し戻しました。';
        return redirect()->route('admin.products.index')->with('success', $msg);
    }
}