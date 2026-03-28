<?php

namespace App\Enums;

enum OrderStatus: int {
    case PENDING = 1;     // 未決済
    case PAID = 2;        // 決済済
    case AT_WAREHOUSE = 3;// 倉庫到着
    case SHIPPED = 4;     // 国際発送完了
}