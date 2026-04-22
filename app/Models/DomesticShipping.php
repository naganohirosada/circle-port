<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomesticShipping extends Model
{
    use SoftDeletes; // 憲法：論理削除

    // 憲法：ステータスは定数（数字）で管理
    const STATUS_PREPARING = 10;
    const STATUS_SHIPPED   = 20;
    const STATUS_RECEIVED  = 30;

    protected $fillable = [
        'domestic_shipping_number',
        'creator_id',
        'warehouse_id',
        'status',
        'tracking_number',
        'carrier',
        'shipped_at',
        'received_at',
        'order_id',
        'group_order_id'
    ];

    protected $casts = [
        'status' => \App\Enums\DomesticShippingStatus::class,
        'shipping_type' => \App\Enums\DomesticShippingType::class, // カラム名に注意
        'shipped_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(DomesticShippingItem::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }

    /**
     * 通常注文とのリレーション
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * GO（共同購入）とのリレーション
     */
    public function groupOrder(): BelongsTo
    {
        return $this->belongsTo(GroupOrder::class);
    }
}