<?php
namespace App\Repositories\Eloquent\Creator;

use App\Repositories\Interfaces\SalesRepositoryInterface;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class SalesRepository implements SalesRepositoryInterface
{
    public function getSuccessfulPaymentsByCreator(int $creatorId)
    {
        return Payment::query()
            ->whereHas('order.orderItems.product', function ($q) use ($creatorId) {
                $q->where('creator_id', $creatorId);
            })
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->with([
                'order.orderItems.product.translations' => function($q) {
                    $q->where('locale', 'ja');
                },
                'breakdowns' // ← ここを追加：内訳データを一括取得
            ])
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}