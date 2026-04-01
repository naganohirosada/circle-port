<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\PaymentRepositoryInterface;
use App\Models\PaymentMethod;
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
        // もし「デフォルトにする」設定なら、既存のデフォルトを解除
        if (isset($stripeData['is_default']) && $stripeData['is_default']) {
            $this->paymentRepo->resetDefault($fanId);
        }

        return $this->paymentRepo->store([
            'fan_id'      => $fanId,
            'type'        => PaymentMethod::TYPE_CREDIT_CARD, // 定数を使用
            'provider'    => 'stripe',
            'provider_id' => $stripeData['id'], // StripeのPaymentMethod ID
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