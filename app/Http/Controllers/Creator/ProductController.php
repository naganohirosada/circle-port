<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\ProductRequest;
use App\Services\Creator\ProductService;
use App\Repositories\Eloquent\Creator\ProductRepository;
use Inertia\Inertia;
use App\Http\Requests\Creator\ProductSearchRequest;
use App\Models\{Product, Category, HsCode, Tag};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        // フィルター項目の抽出
        $filters = $request->only([
            'status', 'tag_id', 'category_id', 'sub_category_id', 
            'product_type', 'price_min', 'price_max', 'keyword'
        ]);

        // Serviceから一覧表示に必要なデータを取得
        $data = $this->service->getIndexData(
            auth()->guard('creator')->id(),
            $filters
        );

        return Inertia::render('Creator/Product/Index', $data);
    }

    // 登録画面
    public function create()
    {
        // 運営指定のタグを翻訳付きで取得
        $tags = Tag::with(['translations' => function($query) {
            // クリエイター画面が日本語なら日本語のみ取得、
            // または全言語取得してフロントで処理
            $query->where('locale', 'ja'); 
        }])->where('is_active', true)->get()->map(function($tag) {
            return [
                'id' => $tag->id,
                // 翻訳テーブルのjaがあればそれを、なければslugを表示
                'name' => $tag->translations->first()?->name ?? $tag->slug,
            ];
        });

        return Inertia::render('Creator/Product/Create', [
            'categories' => Category::with('subCategories')->get(),
            'hs_codes'   => HsCode::all(),
            'tags'       => $tags,
        ]);
    }

    public function store(ProductRequest $request)
    {
        try {
            $this->service->createProduct($request->validated());

            return redirect()->route('creator.products.index')
                ->with('message', '作品を登録し、審査へ提出しました！✨');
        } catch (\Exception $e) {
            Log::error('Product Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => '保存中にエラーが発生しました。']);
        }
    }

    /**
     * 編集画面の表示
      * @param int $id
      * @return \Inertia\Response
     */
    public function edit($id)
    {
        // タグのリレーションを含めて取得
        $product = Product::with([
            'translations', 
            'images', 
            'tags', 
            'variations.translations'
        ])->where('creator_id', auth()->id())->findOrFail($id);

        return Inertia::render('Creator/Product/Edit', [
            'product'    => $product,
            'categories' => Category::with('subCategories')->get(),
            'hs_codes'   => HsCode::all(),
            'tags'       => Tag::with(['translations' => fn($q) => $q->where('locale', 'ja')])
                            ->where('is_active', true)->get()->map(fn($t) => [
                                'id' => $t->id,
                                'name' => $t->translations->first()?->name ?? $t->slug
                            ]),
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
                ->with('message', '作品情報を更新しました！');
                
        } catch (\Exception $e) {
            Log::error('Product Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => '更新に失敗しました。']);
        }
    }

    // 削除処理
    public function destroy($id)
    {
        try {
            $product = $this->repository->findById($id, auth()->guard('creator')->id());
            $this->service->deleteProduct($product);
            return back()->with('message', '作品を削除しました。');

        } catch (\Exception $e) {
            return back()->withErrors(['delete_error' => $e->getMessage()]);
        }
    }
}