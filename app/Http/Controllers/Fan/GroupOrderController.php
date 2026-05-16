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
use App\Models\Order;
use App\Models\Payment;
use App\Services\CategoryService;

class GroupOrderController extends Controller
{
    protected $groupOrderService;
    protected $paymentService;
    protected $categoryService;

    // 憲法：Serviceをインジェクションして利用する
    public function __construct(
        GroupOrderService $groupOrderService,
        PrimaryPaymentService $paymentService,
        CategoryService $categoryService
    ) {
        $this->groupOrderService = $groupOrderService;
        $this->paymentService = $paymentService;
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $filters = $request->all();
        $groupOrders = $this->groupOrderService->searchPublic($filters);

        return Inertia::render('Fan/GroupOrders/Index', [
            'groupOrders' => $groupOrders,
            'filters'    => $filters,
            'categories' => $this->categoryService->getAll(),
            'language'   => $this->getTranslationData(),
        ]);
    }

    /**
     * GO作成画面の表示 (ウィザード形式対応)
     */
    public function create(Request $request)
    {
        $fan = auth()->guard('fan')->user();
        $currentLocale = $fan && $fan->language ? $fan->language->code : app()->getLocale();
        // ロケールコードの調整 (en -> en-us)
        $dbLocale = ($currentLocale === 'en') ? 'en-us' : $currentLocale;

        // 1. すべてのクリエイターを取得 (Step 1 のリスト用)
        $creators = Creator::select('id', 'name', 'shop_name', 'profile_image')->get();

        // 2. すべての商品を翻訳・画像付きで取得 
        // ※ItemSection.jsx 内の .filter() ロジックで利用します
        $products = Product::with(['images', 'translations' => function($q) use ($dbLocale) {
                $q->where('locale', $dbLocale);
            }])
            ->get()
            ->map(function($product) {
                // フロントエンドで扱いやすいように名前を整理
                $product->name = $product->translations->first()?->name ?? 'Unnamed Product';
                return $product;
            });

        $initial_data = [
            'creator_id' => null,
            'item_id' => null,
        ];

        if ($request->filled('item_id')) {
            $product = Product::find($request->item_id);
            if ($product) {
                $initial_data['item_id'] = $product->id;
                $initial_data['creator_id'] = $product->creator_id;
            }
        }


        return Inertia::render('Go/create', [
            'creators' => $creators,
            'products' => $products, // これを渡すことで filter エラーが解消されます
            'initial_selection' => $initial_data,
            'language' => $this->getTranslationData(), // 翻訳データ取得メソッド
            'selected_item_id' => $request->query('item_id'),
        ]);
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
    public function join(int $id, JoinGroupOrderRequest $request)
    {
        try {
            $result = $this->groupOrderService->joinGroupOrder(
                $id, 
                auth()->id(), 
                $request->validated()
            );

            // 文字列（URL）が返ってきた場合はStripeへリダイレクト
            if (is_string($result)) {
                return Inertia::location($result);
            }

            // Orderオブジェクトが返ってきた場合は即時成功としてサンクス画面へ
            return redirect()->route('fan.go.thanks', [
                'id' => $id, 
                'order_id' => $result->id
            ])->with('success', __('Payment completed successfully with your saved card.'));

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * 詳細画面
     * @param int $id
     */
    public function show(int $id, Request $request): Response
    {
        $go = $this->groupOrderService->getPublicDetail($id);

        $isJoined = false;
        if (auth()->guard('fan')->check()) {
            $isJoined = $go->participants()
                ->where('fan_id', auth()->guard('fan')->id())
                ->exists();
        }

        // 非公開設定のチェック
        if ($go->is_private) {
            $inviteCode = $request->query('invite');
            $isAllowed = false;

            // 1. URLの招待コードが一致するか
            if ($inviteCode && $go->invite_code === $inviteCode) {
                $isAllowed = true;
            }

            // 2. ログインユーザーが許可リストにいるか
            if (!$isAllowed && auth()->guard('fan')->check()) {
                $isAllowed = $go->allowedFans()->where('fan_id', auth()->guard('fan')->id())->exists();
            }

            if (!$isAllowed) {
                abort(403, __('This Group Order is private. You need an invitation link to access.'));
            }
        }
    
        // このGOに対して、ログイン中のユーザーが決済失敗した注文を持っていないか確認
        $previousOrder = null;
        if (auth()->guard('fan')->check()) {
            $fanId = auth()->guard('fan')->id();

            $participant = \App\Models\GroupOrderParticipant::where('group_order_id', $id)
                ->where('fan_id', $fanId)
                ->whereHas('primaryOrder.payment', function ($query) {
                    $query->where('status', Payment::STATUS_FAILED); 
                })
                ->with(['primaryOrder.payment' => function ($query) {
                    $query->latest();
                }])
                ->first();

            if ($participant && $participant->primaryOrder) {
                $latestPayment = $participant->primaryOrder->payments->first();
                if ($latestPayment && $latestPayment->status === Payment::STATUS_FAILED) {
                    $previousOrder = $participant->primaryOrder;
                }
            }
        }

        // 限定公開（is_private）のチェック
        if ($go->is_private) {
            $fan = auth()->guard('fan')->user();
            // 未ログイン、または許可リストにいない場合は403エラー
            if (!$fan || !$go->allowedFans()->where('fan_id', $fan->id)->exists()) {
                abort(403, __('You do not have permission to access this private project.'));
            }
        }

        $addresses = auth()->guard('fan')->check() ? auth()->guard('fan')->user()->shippingAddresses()->latest()->get() : [];

        return Inertia::render('Fan/GroupOrders/Show', [
            'go' => $go,
            'addresses' => $addresses,
            'previousOrder' => $previousOrder,
            'isJoined' => $isJoined,
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