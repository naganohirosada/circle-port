<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\ProductRequest;
use App\Services\Creator\ProductService;
use App\Repositories\Eloquent\Creator\ProductRepository;
use Inertia\Inertia;
use App\Http\Requests\Creator\ProductSearchRequest;
use App\Models\{Product, Category, HsCode};
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service,
        protected ProductRepository $repository
    ) {}

    /**
     * 商品一覧の表示（検索・フィルタリング対応）
      * @param ProductSearchRequest $request
      * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Product::where('creator_id', auth()->id())
            ->with(['translations', 'images', 'category', 'hs_code']);

        // --- 検索ロジック ---
        // 商品タイトル（日本語名で検索）
        if ($request->name) {
            $query->whereHas('translations', function($q) use ($request) {
                $q->where('locale', 'ja')->where('name', 'like', "%{$request->name}%");
            });
        }

        // カテゴリ
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // HSコード
        if ($request->hs_code_id) {
            $query->where('hs_code_id', $request->hs_code_id);
        }

        // ステータス
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // SKU
        if ($request->sku) {
            $query->where('sku', 'like', "%{$request->sku}%");
        }

        return Inertia::render('Creator/Product/Index', [
            'products' => $query->latest()->paginate(20)->withQueryString(),
            'categories' => Category::all(),
            'hs_codes' => HsCode::all(),
            'filters' => $request->only(['name', 'category_id', 'hs_code_id', 'status', 'sku'])
        ]);
    }

    // 登録画面
    public function create()
    {
        return Inertia::render('Creator/Product/Create', [
            'categories' => \App\Models\Category::with('subCategories')->get(),
            'hs_codes'   => \App\Models\HsCode::all(),
        ]);
    }

    // 保存処理
    public function store(ProductRequest $request)
    {
        try {
            $product = $this->service->createProduct($request->validated());
            return redirect()->route('creator.products.index')
                ->with('message', '作品が世界に向けて公開されました！🚀');
                
        } catch (\Exception $e) {
            \Log::error('Product Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => '保存に失敗しました。時間をおいて再度お試しください。']);
        }
    }

    /**
     * 編集画面の表示
      * @param int $id
      * @return \Inertia\Response
     */
    public function edit($id)
    {
        $product = Product::with(['translations', 'images', 'variations.translations'])->findOrFail($id);

        return Inertia::render('Creator/Product/Edit', [
            'product'    => $product,
            'categories' => Category::with('subCategories')->get(),
            'hs_codes'   => HsCode::all(),
        ]);
    }

    /**
     * 更新処理
      * @param ProductRequest $request
      * @param int $id
      * @return \Illuminate\Http\RedirectResponse
     */
    public function update(ProductRequest $request, $id)
    {
        try {
            $this->service->updateProduct($id, $request->validated());
            
            return redirect()->route('creator.products.index')
                ->with('message', '作品情報を更新しました！✨');
                
        } catch (\Exception $e) {
            \Log::error('Product Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => '更新に失敗しました。']);
        }
    }

    // 削除処理
    public function destroy($id)
    {
        $product = $this->repository->findById($id, auth()->guard('creator')->id());
        $this->service->deleteProduct($product);

        return back()->with('message', 'Deleted successfully (T_T)');
    }
}