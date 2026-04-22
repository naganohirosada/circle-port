<?php

namespace App\Repositories\Eloquent\Admin;

use App\Models\InternationalShipping;
use App\Models\InternationalShippingItem;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Enums\InternationalShippingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use App\Enums\PaymentStatus;
use App\Models\PaymentBreakdown;

class InternationalShippingRepository implements InternationalShippingRepositoryInterface
{
    public function firstOrCreatePending(int $fanId, array $defaults): InternationalShipping
    {
        return InternationalShipping::firstOrCreate(
            [
                'fan_id' => $fanId, 
                'status' => InternationalShippingStatus::PENDING->value // 数値を使用
            ],
            $defaults
        );
    }

    public function createItem(array $data)
    {
        return InternationalShippingItem::create($data);
    }

    public function paginateByStatus(array $statuses, int $perPage = 20): LengthAwarePaginator
    {
        return InternationalShipping::whereIn('status', $statuses)
            ->with(['fan', 'address.country'])
            ->withCount('items')
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }

    public function findByIdWithDetails(int $id): InternationalShipping
    {
        return InternationalShipping::with([
            'fan',
            'address.country',
            'items.orderItem.product.translations',
            'items.orderItem.variation.translations'
        ])->findOrFail($id);
    }

    public function update(int $id, array $data): bool
    {
        return InternationalShipping::findOrFail($id)->update($data);
    }

    public function findForPayment(int $id, int $fanId): InternationalShipping
    {
        return InternationalShipping::where('fan_id', $fanId)
            ->where('status', \App\Enums\InternationalShippingStatus::WAITING_PAYMENT)
            ->findOrFail($id);
    }

    /**
     * 支払い完了時のステータス更新（一括処理）
     */
    public function markAsPaid(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $shipping = InternationalShipping::with('items.orderItem')->findOrFail($id);

            // 1. 国際配送のステータスを「支払い完了(40)」へ
            $shipping->update(['status' => \App\Enums\InternationalShippingStatus::PAID]);

            // 2. 紐付く全アイテムを「出荷準備中」へ更新
            foreach ($shipping->items as $item) {
                if ($item->orderItem) {
                    $item->orderItem->update([
                        'status' => \App\Enums\OrderStatus::SHIPPING_PREPARATION
                    ]);
                }
            }
            return true;
        });
    }

    /**
     * ファンの言語設定に合わせた配送一覧を取得
     * 戻り値の型をインターフェースと完全に一致させる
     */
    public function getByFanWithTranslations(int $fanId, string $locale): Collection
    {
        return InternationalShipping::where('fan_id', $fanId)
            ->with([
                'address.country',
                'items.orderItem.product.translations' => function ($query) use ($locale) {
                    $query->where('locale', $locale);
                },
                'items.orderItem.product.images',
                'items.orderItem.variation.translations' => function ($query) use ($locale) {
                    $query->where('locale', $locale);
                },
                'carrier'
            ])
            ->orderByRaw("FIELD(status, 30, 20, 10, 40, 50)")
            ->orderBy('created_at', 'desc')
            ->get(); // get() は Eloquent\Collection を返します
    }

    public function confirmPackingAndFee(int $id, array $data): void
    {
        DB::transaction(function () use ($id, $data) {
            $shipping = \App\Models\InternationalShipping::findOrFail($id);

            // 1. 国際配送データの更新（重量・サイズ・送料・ステータス）
            $shipping->update([
                'total_weight' => $data['total_weight'],
                'dimensions'   => $data['dimensions'],
                'shipping_fee' => $data['shipping_fee'],
                'carrier_id'   => $data['carrier_id'] ?? null,
                'status'       => 30, // Waiting for payment
            ]);

            // 2. payments テーブルに「未決済(pending)」レコードを作成
            $paymentId = DB::table('payments')->insertGetId([
                'total_amount'     => $data['shipping_fee'],
                'status'     => PaymentStatus::PENDING,
                'method_type' => 2,
                'currency_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. payment_breakdowns テーブルに内訳を作成
            DB::table('payment_breakdown')->insert([
                'payment_id' => $paymentId,
                'type'       => PaymentBreakdown::TYPE_INTL_SHIPPING,
                'amount'     => $data['shipping_fee'],
                'currency_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 4. 中間テーブル (international_shipping_payment) で紐付け
            DB::table('international_shipping_payment')->insert([
                'payment_id'                => $paymentId,
                'international_shipping_id' => $id,
                'amount'                    => $data['shipping_fee'],
                'created_at'                => now(),
                'updated_at'                => now(),
            ]);
        });
    }
}