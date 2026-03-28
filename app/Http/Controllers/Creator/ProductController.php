<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\ProductRequest;
use App\Services\Creator\ProductService;
use App\Repositories\Eloquent\Creator\ProductRepository;
use Inertia\Inertia;
use App\Http\Requests\Creator\ProductSearchRequest;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service,
        protected ProductRepository $repository
    ) {}

    // 一覧・検索
    public function index(ProductSearchRequest $request)
    {
        $creatorId = auth()->guard('creator')->id();
        
        // 検索・ページネーション込みで取得
        $products = $this->repository->getPaginatedForCreator(
            $creatorId, 
            $request->validated()
        );

        return Inertia::render('Creator/Product/Index', [
            'products' => $products,
            'filters'  => $request->only(['search', 'status']),
            'flash'    => ['message' => session('message')]
        ]);
    }

    // 登録画面
    public function create()
    {
        return Inertia::render('Creator/Product/Create', [
            'categories' => \App\Models\Category::all()
        ]);
    }

    // 保存処理
    public function store(ProductRequest $request)
    {
        $this->service->storeProduct(
            $request->validated(),
            auth()->guard('creator')->id()
        );

        return redirect()->route('creator.products.index')
            ->with('message', 'Product released to the world! 🚀');
    }

    // 編集画面
    public function edit($id)
    {
        $product = $this->repository->findById($id, auth()->guard('creator')->id());
        return Inertia::render('Creator/Product/Edit', ['product' => $product]);
    }

    // 更新処理
    public function update(ProductRequest $request, $id)
    {
        $product = $this->repository->findById($id, auth()->guard('creator')->id());
        $this->service->updateProduct($product, $request->validated());

        return redirect()->route('creator.products.index');
    }

    // 削除処理
    public function destroy($id)
    {
        $product = $this->repository->findById($id, auth()->guard('creator')->id());
        $this->service->deleteProduct($product);

        return back()->with('message', 'Deleted successfully (T_T)');
    }
}