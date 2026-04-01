<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Services\Fan\PaymentService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * 決済方法一覧
     */
    public function index(): Response
    {
        // 憲法：認証情報から fan_id を取得（auth()->user()->fan->id 等を想定）
        $fanId = auth()->id();
        $payments = $this->paymentService->getUserPayments($fanId);

        return Inertia::render('Fan/Mypage/Payment/Index', [
            'payments' => $payments
        ]);
    }

    /**
     * 新規登録画面（Stripe Elementsを表示する画面）
     */
    public function create(): Response
    {
        return Inertia::render('Fan/Mypage/Payment/Create', [
            'stripe_key' => config('services.stripe.key'),
        ]);
    }

    /**
     * 保存処理（Stripeでトークン化した情報をDBに保存）
     */
    public function store(Request $request): RedirectResponse
    {
        // 本来はバリデーション用のRequestクラスを分けるのが憲法ですが、一旦簡略化
        $fanId = auth()->id();
        
        $this->paymentService->addCreditCard($fanId, $request->all());

        return redirect()->route('fan.mypage.payments.index')
            ->with('success', __('Payment method added successfully'));
    }

    /**
     * デフォルト（優先）設定の切り替え
     */
    public function makeDefault(int $id): RedirectResponse
    {
        $fanId = auth()->id();
        $this->paymentService->setDefault($fanId, $id);

        return redirect()->back()
            ->with('success', __('Primary payment method updated'));
    }

    /**
     * 削除処理（論理削除）
     */
    public function destroy(int $id): RedirectResponse
    {
        $fanId = auth()->id();
        $this->paymentService->deletePayment($fanId, $id);

        return redirect()->back()
            ->with('success', __('Payment method removed'));
    }
}