<?php

namespace App\Enums;

enum PaymentStatus: int
{
    case PENDING = 10; // 未決済
    case AUTHORIZED_HOLD = 15; // 仮売上（Stripe与信枠確保・GOM承認審査待ち）
    case SUCCEEDED = 20; // 決済成功
    case FAILED = 30; // 決済失敗
    case REFUNDED = 40; // 返金

    /**
     * システムのロケールに応じて最適なステータス名を返却
     */
    public function label(): string
    {
        $locale = app()->getLocale();

        return match ($this) {
            self::PENDING => $locale === 'ja' ? '未決済' : 'Pending',
            self::AUTHORIZED_HOLD => $locale === 'ja' ? '保留中（GOM承認審査待ち）' : 'Pending GOM Approval',
            self::SUCCEEDED => $locale === 'ja' ? '決済完了' : 'Succeeded',
            self::FAILED => $locale === 'ja' ? '決済失敗' : 'Failed',
            self::REFUNDED => $locale === 'ja' ? '返金済み' : 'Refunded',
        };
    }
}