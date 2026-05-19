<?php

namespace App\Enums;

enum PaymentMethodType: int
{
    case CREDIT_CARD   = 10;
    case PAYPAL        = 20;
    case BANK_TRANSFER = 30;
    case STRIPE        = 40;
    case ALIPAY        = 50; // 中華圏主要決済
    case GRABPAY       = 51; // 東南アジア主要決済
    case PROMPTPAY     = 52; // タイ主要決済
    case OTHER         = 90;

    public function label(): string
    {
        return match($this) {
            self::CREDIT_CARD   => 'クレジットカード',
            self::PAYPAL        => 'PayPal',
            self::BANK_TRANSFER => '銀行振込',
            self::STRIPE        => 'Stripe',
            self::ALIPAY        => 'Alipay',
            self::GRABPAY       => 'GrabPay',
            self::PROMPTPAY     => 'PromptPay',
            self::OTHER         => 'その他',
        };
    }

    /**
     * Stripeのpayment_methodタイプ文字列から自社のEnumへマッピング
     */
    public static function fromStripeType(string $type): self
    {
        return match($type) {
            'card'       => self::CREDIT_CARD,
            'paypal'     => self::PAYPAL,
            'alipay'     => self::ALIPAY,
            'grabpay'    => self::GRABPAY,
            'promptpay'  => self::PROMPTPAY,
            default      => self::OTHER,
        };
    }
}