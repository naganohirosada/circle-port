<?php

namespace App\Enums;

enum DomesticShippingStatus: int
{
    case PREPARING = 10;
    case SHIPPED = 20;
    case RECEIVED = 30;

    public function label(): string
    {
        return match($this) {
            self::PREPARING => '準備中',
            self::SHIPPED   => '発送済み',
            self::RECEIVED  => '受領済み',
        };
    }
}