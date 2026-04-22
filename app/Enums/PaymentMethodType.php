<?php

namespace App\Enums;

enum PaymentMethodType: int
{
    case CREDIT_CARD = 10;
    case PAYPAL = 20;
    case BANK_TRANSFER = 30;
    case STRIPE = 40; // Stripeを個別に管理する場合
    case OTHER = 90;

    public function label(): string
    {
        return match($this) {
            self::CREDIT_CARD   => 'クレジットカード',
            self::PAYPAL        => 'PayPal',
            self::BANK_TRANSFER => '銀行振込',
            self::STRIPE        => 'Stripe',
            self::OTHER         => 'その他',
        };
    }
}