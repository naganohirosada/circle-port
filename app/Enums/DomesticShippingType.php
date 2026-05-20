<?php

namespace App\Enums;

enum DomesticShippingType: int
{
    case REGULAR = 10;
    case GO = 20;
    case STOCK_IN = 30; // 【追加】新規作品の倉庫一括納品プラン
}