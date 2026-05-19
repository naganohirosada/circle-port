<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Services\Fan\PaymentService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\Fan; 
use Illuminate\Support\Facades\Auth;
use Stripe\SetupIntent;
use Stripe\Stripe;

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
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        $fan = Fan::findOrFail(auth()->id());

        // Stripe顧客IDがなければ作成して保存
        if (empty($fan->stripe_customer_id)) {
            $customer = \Stripe\Customer::create([
                'email' => $fan->email,
                'name'  => $fan->name,
                'metadata' => ['fan_id' => $fan->id]
            ]);
            $fan->update(['stripe_customer_id' => $customer->id]);
        }

        // 将来の自動引き落とし（GOのバッチ等）や、安全な決済手段保存のためのSetupIntentを作成
        $setupIntent = SetupIntent::create([
            'customer' => $fan->stripe_customer_id,
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return Inertia::render('Fan/Mypage/Payment/Create', [
            'stripe_key'    => config('services.stripe.key'),
            'client_secret' => $setupIntent->client_secret,
        ]);
    }


    /**
     * 保存処理（Stripeでトークン化した情報をDBに保存）
     */
        public function store(Request $request): RedirectResponse
        {
            $fanId = auth()->id();
            
            $request->validate([
                'payment_method_id' => 'required|string',
            ]);

            $this->paymentService->addSavedPaymentMethod($fanId, $request->payment_method_id, $request->get('is_default', false));

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

    /**
     * PayPal等のリダイレクト決済から戻ってきた際のコールバック処理
     */
    public function callback(Request $request): RedirectResponse
    {
        $setupIntentId = $request->query('setup_intent');
        
        if (!$setupIntentId) {
            return redirect()->route('fan.mypage.payments.index')
                ->with('error', __('Invalid request'));
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        
        try {
            $setupIntent = SetupIntent::retrieve($setupIntentId);

            if ($setupIntent->status === 'succeeded') {
                // 認証成功した決済手段をサービス層に渡し、DBに登録
                $this->paymentService->addSavedPaymentMethod(
                    auth()->id(),
                    $setupIntent->payment_method,
                    false
                );

                return redirect()->route('fan.mypage.payments.index')
                    ->with('success', __('Payment method registered successfully'));
            }

            return redirect()->route('fan.mypage.payments.index')
                ->with('error', __('Payment setup failed'));

        } catch (\Exception $e) {
            return redirect()->route('fan.mypage.payments.index')
                ->with('error', $e->getMessage());
        }
    }
}