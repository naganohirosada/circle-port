<?php

namespace App\Enums;

enum InternationalShippingStatus: int
{
    case PENDING = 10;        // 商品待ち（同梱中）
    case PACKING = 20;        // 梱包中（重さ・サイズ入力待ち）
    case WAITING_PAYMENT = 30; // 送料支払い待ち（2次決済依頼済み）
    case PAID = 40;           // 支払い完了
    case SHIPPED = 50;        // 出荷済み
    case CANCELLED = 90;      // キャンセル
}