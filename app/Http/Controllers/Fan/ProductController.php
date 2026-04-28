<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tag;
use App\Services\Fan\ProductService;

class ProductController extends Controller
{

    protected $service;

    public function __construct(ProductService $service)
    {
        $this->service = $service;
    }

    /**
     * 商品一覧表示
     */
    public function index(Request $request)
    {
        $data = $this->service->getProductIndexData($request->all());

        return Inertia::render('Fan/Product/Index', $data);
    }

    /**
     * 商品詳細表示
     * @param Product $product
     * @return \Inertia\Response
     */
    public function show(Product $product)
    {
        if ($product->status !== Product::STATUS_PUBLISHED) {
            abort(404);
        }

        $product->load([
            'translations', 
            'images', 
            'creator', 
            'category.translations', 
            'subCategory.translations',
            'variations.translations'
        ]);

        return Inertia::render('Fan/Product/Show', [
            'product' => $product,
        ]);
    }
}