<?php

namespace App\Services\Fan;

use App\Models\Order;

class MypageService
{
    public function getPurchaseStats(int $userId): array
    {
        // 本来はRepository経由で取得するのが憲法ですが、
        // まずは動作確認用にダミー数値を返却するか、簡易的なクエリを書きます
        return [
            'ordered_count'       => 1,
            'warehouse_count'     => 2,
            'shipping_count'      => 3,
            'consolidation_count' => 0, // 同梱待ちロジックは後ほど実装
        ];
    }
}