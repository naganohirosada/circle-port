<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\GroupOrder\GroupOrderStoreRequest;
use App\Http\Requests\Fan\GroupOrder\JoinGroupOrderRequest;
use App\Services\Fan\GroupOrderService;
use App\Services\Gom\PrimaryPaymentService;
use Inertia\Response;
use App\Models\Product;
use Inertia\Inertia;
use App\Models\Creator;
use Illuminate\Http\Request;
use App\Models\Fan;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;

class GroupOrderController extends Controller
{
    protected $groupOrderService;
    protected $paymentService;

    // 憲法：Serviceをインジェクションして利用する
    public function __construct(
        GroupOrderService $groupOrderService,
        PrimaryPaymentService $paymentService
    ) {
        $this->groupOrderService = $groupOrderService;
        $this->paymentService = $paymentService;
    }

    /**
     * GO作成画面の表示
     * @param int|null $product_id 商品詳細からの遷移時に渡される
     */
    public function create(Request $request)
    {
        $fan = auth()->guard('fan')->user();
        $currentLocale = $fan && $fan->language ? $fan->language->code : app()->getLocale();
        $dbLocale = ($currentLocale === 'en') ? 'en-us' : $currentLocale;

        // 1. 初期ロードはクリエイターの基本リストのみ（商品は含めない）
        $creators = Creator::select('id', 'name')->get();

        $initial_item = null;
        $initial_creator = null;
        $creator_products = [];

        // 2. 商品詳細から来た場合は、そのクリエイターの商品だけを初期データとして渡す
        if ($request->filled('item_id')) {
            $initial_item = Product::with(['translations' => function($q) use ($dbLocale) {
                    $q->where('locale', $dbLocale);
                }, 'creator'])
                ->findOrFail($request->item_id);

            $initial_creator = $initial_item->creator;
            $initial_item->name = $initial_item->translations->first()?->name ?? $initial_item->name;

            if ($initial_creator) {
                $creator_products = $this->fetchTranslatedProducts($initial_creator->id, $dbLocale);
            }
        }

        return inertia('Go/create', [
            'creators' => $creators,
            'initial_creator' => $initial_creator,
            'initial_item' => $initial_item,
            'initial_products' => $creator_products, // 名前を変更して判別しやすく
            'language' => $this->getTranslationData(),
        ]);
    }

    /**
     * 現在のロケールに基づいた翻訳データの取得
     */
    private function getTranslationData()
    {
        $locale = app()->getLocale();
        $path = resource_path("lang/{$locale}.json");
        
        return file_exists($path) 
            ? json_decode(file_get_contents($path), true) 
            : [];
    }

    /**
     * GOの保存処理
     */
    public function store(GroupOrderStoreRequest $request)
    {
        // 憲法：バリデーションは Form Request で実施済み
        $validated = $request->validated();

        try {
            // 憲法：ビジネスロジック（保存・翻訳登録・アイテム紐付け）はServiceに丸投げ
            $groupOrder = $this->groupOrderService->createGroupOrder($validated);

            return redirect()->route('fan.mypage.dashboard')
                ->with('success', 'Group Order created successfully! 🚀');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create Group Order.']);
        }
    }

    /**
     * 公開中のGroup Order一覧（検索）
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['name', 'creator', 'min_price', 'max_price', 'category_id']);
        // 公開設定かつ募集中のものを取得
        $groupOrders = $this->groupOrderService->searchPublicGroupOrders($filters);
        return Inertia::render('Fan/GroupOrders/Index', [
            'groupOrders' => $groupOrders,
            'filters' => $filters,
            // 検索用のカテゴリ一覧（必要に応じて）
            'categories' => $this->groupOrderService->getSearchCategories(),
        ]);
    }

    /**
     * 非同期取得用のメソッド
     */
    public function getProducts(Creator $creator)
    {
        $fan = auth()->guard('fan')->user();
        $currentLocale = $fan && $fan->language ? $fan->language->code : app()->getLocale();
        $dbLocale = ($currentLocale === 'en') ? 'en-us' : $currentLocale;

        return response()->json(
            $this->fetchTranslatedProducts($creator->id, $dbLocale)
        );
    }

    /**
     * 共通の翻訳商品取得ロジック
     */
    private function fetchTranslatedProducts($creatorId, $dbLocale)
    {
        return Product::with(['translations', 'variations.translations' => function($q) use ($dbLocale) {
                $q->where('locale', $dbLocale);
            }])
            ->where('creator_id', $creatorId)
            ->get()
            ->map(function($product) {
                $product->name = $product->translations->first()?->name ?? $product->name;
                return $product;
            });
    }

    /**
     * GO招待用のファン検索API
     */
    public function searchFan(Request $request)
    {
        $fan = $this->groupOrderService->searchFanForInvitation(
            $request->query('unique_id')
        );

        return response()->json($fan);
    }

    /**
     * GO参加処理
     */
    public function join(JoinGroupOrderRequest $request, int $id)
    {
        try {
            // Service層で注文を作成し、作成された注文データを取得
            $order = $this->groupOrderService->joinGroupOrder($id, auth()->id(), $request->validated());

            // 完了画面へリダイレクト（注文IDを渡す）
            return redirect()->route('fan.go.thanks', ['id' => $id, 'order_id' => $order->id]);
                
        } catch (\Exception $e) {
            dd($e->getMessage(), $e->getTraceAsString());
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * 詳細画面
     * @param int $id
     */
    public function show(int $id): Response
    {
        $go = $this->groupOrderService->getPublicDetail($id);

        // 限定公開（is_private）のチェック
        if ($go->is_private) {
            $fan = auth()->user();
            // 未ログイン、または許可リストにいない場合は403エラー
            if (!$fan || !$go->allowedFans()->where('fan_id', $fan->id)->exists()) {
                abort(403, __('You do not have permission to access this private project.'));
            }
        }

        $addresses = auth()->check() ? auth()->user()->shippingAddresses()->latest()->get() : [];

        return Inertia::render('Fan/GroupOrders/Show', [
            'go' => $go,
            'addresses' => $addresses,
        ]);
    }

    /**
     * 注文完了画面
     */
    public function thanks(int $id, int $order_id): Response
    {
        $go = $this->groupOrderService->getPublicDetail($id);
        $order = Order::findOrFail($order_id);

        return Inertia::render('Fan/GroupOrders/Thanks', [
            'go' => $go,
            'order' => $order,
        ]);
    }

    public function executePayment(int $id)
    {
        try {
            // Serviceを呼び出すだけ
            $this->paymentService->requestPayment($id);

            return back()->with('success', 'Primary payment processing has started.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}