<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\PaymentRepositoryInterface;
use App\Models\PaymentMethod;
use App\Models\Fan;
use Illuminate\Database\Eloquent\Collection;
use App\Enums\PaymentMethodType;

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
        public function addSavedPaymentMethod(int $fanId, string $stripePaymentMethodId, bool $isDefault): PaymentMethod
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        // Stripeから確定した決済方法オブジェクトを回収
        $stripePm = \Stripe\PaymentMethod::retrieve($stripePaymentMethodId);
        
        // Enumを使い決済タイプを抽象化判定
        $methodType = PaymentMethodType::fromStripeType($stripePm->type);

        // 各タイプに応じたメタデータのディープな抽出（extra_details等にカプセル化して商品・検閲情報の秘匿への布石に）
        $brand = null;
        $last4 = null;
        $expMonth = null;
        $expYear = null;
        $extraDetails = [];

        if ($stripePm->type === 'card') {
            $brand = $stripePm->card->brand;
            $last4 = $stripePm->card->last4;
            $expMonth = $stripePm->card->exp_month;
            $expYear = $stripePm->card->exp_year;
        } else {
            // PayPalやGrabPayなど、カード以外の情報がある場合
            $typeStr = $stripePm->type;
            if (isset($stripePm->$typeStr)) {
                $targetDetails = $stripePm->$typeStr;

                // 【修正】型をチェックして安全に配列に変換
                if (is_array($targetDetails)) {
                    $extraDetails = $targetDetails;
                } elseif (is_object($targetDetails) && method_exists($targetDetails, 'toArray')) {
                    $extraDetails = $targetDetails->toArray();
                } else {
                    $extraDetails = (array) $targetDetails;
                }

                $brand = $stripePm->type; // 表示用のブランド識別子として流用
            }
        }

        if ($isDefault) {
            $this->paymentRepo->resetDefault($fanId);
        }

        // 自社DB（payment_methodsテーブル）へマルチ決済方法として正規化保存
        return $this->paymentRepo->store([
            'fan_id'        => $fanId,
            'type'          => $methodType->value, // Enumの整数値 (10, 20, 50等)
            'provider'      => 'stripe',           // 将来のマルチゲートウェイ（多ルート化）の識別子
            'provider_id'   => $stripePaymentMethodId,
            'brand'         => $brand,
            'last4'         => $last4,
            'exp_month'     => $expMonth,
            'exp_year'      => $expYear,
            'extra_details' => $extraDetails,
            'is_default'    => $isDefault ? 1 : 0,
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