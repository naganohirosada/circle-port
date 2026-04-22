<?php

namespace App\Repositories\Eloquent\Admin;

use App\Models\InternationalShipping;
use App\Models\InternationalShippingItem;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Enums\InternationalShippingStatus;
use Illuminate\Pagination\LengthAwarePaginator;

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
}