<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\PaymentRepositoryInterface;
use App\Models\PaymentMethod;
use App\Models\Fan;
use Illuminate\Database\Eloquent\Collection;

class PaymentService
{
    protected $paymentRepo;

    public function __construct(PaymentRepositoryInterface $paymentRepo)
    {
        $this->paymentRepo = $paymentRepo;
    }

    /**
     * 1. 特定ファンの決済方法一覧を取得
     * 憲法：ロジック（並び順など）をサービスで管理
     */
    public function getUserPayments(int $fanId): Collection
    {
        return $this->paymentRepo->getByFanId($fanId);
    }

    /**
     * 2. クレジットカード情報の保存
     */
    public function addCreditCard(int $fanId, array $stripeData): PaymentMethod
    {
        // Stripe APIキーの設定
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $fan = Fan::findOrFail($fanId);

        // 1. もしファンがまだ Stripe Customer ID を持っていなければ作成する
        if (empty($fan->stripe_customer_id)) {
            $customer = \Stripe\Customer::create([
                'email' => $fan->email,
                'name'  => $fan->name, // 必要に応じて
                'metadata' => ['fan_id' => $fan->id]
            ]);

            $fan->update(['stripe_customer_id' => $customer->id]);
            $customerId = $customer->id;
        } else {
            $customerId = $fan->stripe_customer_id;
        }

        // 2. 重要：取得したカード(pm_xxx)を Stripe 上の顧客に紐付ける
        // これをしないと、後で「保存済みカード」として呼び出せません
        $paymentMethod = \Stripe\PaymentMethod::retrieve($stripeData['id']);
        
        // まだ紐付いていない場合のみ Attach する
        if (empty($paymentMethod->customer)) {
            $paymentMethod->attach(['customer' => $customerId]);
        }

        // 3. 既存のデフォルト設定を解除
        if (isset($stripeData['is_default']) && $stripeData['is_default']) {
            $this->paymentRepo->resetDefault($fanId);
        }

        // 4. 自社DB（payment_methodsテーブル）への保存
        return $this->paymentRepo->store([
            'fan_id'      => $fanId,
            'type'        => PaymentMethod::TYPE_CREDIT_CARD,
            'provider'    => 'stripe',
            'provider_id' => $stripeData['id'], // pm_xxx
            'brand'       => $stripeData['brand'],
            'last4'       => $stripeData['last4'],
            'exp_month'   => $stripeData['exp_month'],
            'exp_year'    => $stripeData['exp_year'],
            'is_default'  => ($stripeData['is_default'] ?? false) ? 1 : 0,
        ]);
    }

    /**
     * 3. 優先（デフォルト）決済方法の切り替え
     */
    public function setDefault(int $fanId, int $paymentMethodId): bool
    {
        // 本人の所有物かチェック
        $payment = $this->paymentRepo->findByIdAndFan($paymentMethodId, $fanId);
        if (!$payment) return false;

        $this->paymentRepo->resetDefault($fanId);
        return $this->paymentRepo->update($paymentMethodId, ['is_default' => 1]);
    }

    /**
     * 4. 決済方法の削除（論理削除）
     */
    public function deletePayment(int $fanId, int $paymentMethodId): bool
    {
        // 憲法：削除前に必ず本人確認を行う
        $payment = $this->paymentRepo->findByIdAndFan($paymentMethodId, $fanId);

        if (!$payment) {
            return false;
        }

        // 本来ならここで Stripe API を叩いて外部側のカードも無効化するロジックが入る
        return $this->paymentRepo->delete($paymentMethodId);
    }
}