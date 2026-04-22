<?php

namespace App\Enums;

enum PaymentBreakdownType: int
{
    case ITEM_TOTAL = 1;
    case DOMESTIC_SHIPPING = 2;
    case INTL_SHIPPING = 3;
    case HANDLING_FEE = 4;
    case ITEM_TAX = 5;
    case DISCOUNT = 6;
    case SHIPPING_TAX = 7;
}