<?php

namespace App\Enums;

/**
 * Group Order ステータス定義 (Int型ベース)
 */
enum GroupOrderStatus: int
{
    case DRAFT = 0;           // 下書き
    case RECRUITING = 1;      // 募集中
    case CLOSED = 2;          // 募集終了（注文作業中）
    case ORDERED = 3;         // 発注済み
    case ARRIVED = 4;         // 拠点到着（二次決済待ち）
    case SHIPPING = 5;        // 配送中
    case COMPLETED = 6;       // 完了
    case CANCELLED = 9;       // キャンセル

    /**
     * 表示用ラベル（翻訳対応）
     */
    public function label(): string
    {
        return match($this) {
            self::DRAFT      => __('Draft'),
            self::RECRUITING => __('Recruiting'),
            self::CLOSED     => __('Closed'),
            self::ORDERED    => __('Ordered'),
            self::ARRIVED    => __('Arrived at Hub'),
            self::SHIPPING   => __('In Shipping'),
            self::COMPLETED  => __('Completed'),
            self::CANCELLED  => __('Cancelled'),
        };
    }

    /**
     * UI表示用のカラー（Tailwind用）
     */
    public function color(): string
    {
        return match($this) {
            self::RECRUITING => 'cyan',
            self::COMPLETED  => 'slate',
            self::CANCELLED  => 'red',
            default          => 'slate',
        };
    }
}