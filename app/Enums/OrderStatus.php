<?php

namespace App\Enums;

enum OrderStatus: int {
    case PENDING = 1;                   // 未決済
    case PAID = 2;                      // 1次決済済（受注受付完了）
    case MANUFACTURING = 7;             // 製造中（仕様書フェーズ2）
    case TRANSPORTING_TO_WAREHOUSE = 8; // 倉庫へ輸送中（仕様書フェーズ3）
    case AT_WAREHOUSE = 3;              // 倉庫到着・検品完了（2次決済待ち）
    case SHIPPING_PREPARATION = 4;      // 出荷準備中（2次決済完了・梱包中）
    case SHIPPED = 5;                   // 国際発送完了
    case DOMESTIC_DIRECT_SHIPPED = 6;   // 国内直接発送完了（※互換用ノイズ保護）

    /**
     * システムのロケールに応じて最適な進捗ステータス名を返却
     */
    public function label(): string
    {
        $locale = app()->getLocale();

        return match ($this) {
            self::PENDING => $locale === 'ja' ? '支払い待ち' : 'Awaiting Payment',
            self::PAID => $locale === 'ja' ? '受注完了（1次決済済）' : 'Order Placed (Phase-1 Paid)',
            self::MANUFACTURING => $locale === 'ja' ? 'グッズ製造中' : 'Manufacturing Goods',
            self::TRANSPORTING_TO_WAREHOUSE => $locale === 'ja' ? '日本倉庫へ陸送中' : 'In Transit to WH',
            self::AT_WAREHOUSE => $locale === 'ja' ? '倉庫到着（2次決済待ち）' : 'Arrived at WH (Awaiting Phase-2)',
            self::SHIPPING_PREPARATION => $locale === 'ja' ? '国際出荷準備中' : 'Preparing International Dispatch',
            self::SHIPPED => $locale === 'ja' ? '国際発送完了' : 'Shipped International',
            self::DOMESTIC_DIRECT_SHIPPED => $locale === 'ja' ? '国内発送完了' : 'Shipped Domestic',
        };
    }
}