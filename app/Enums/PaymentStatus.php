<?php

namespace App\Enums;

enum PaymentStatus: int
{
    case PENDING = 10;
    case SUCCEEDED = 20;
    case FAILED = 30;
    case REFUNDED = 40;
}