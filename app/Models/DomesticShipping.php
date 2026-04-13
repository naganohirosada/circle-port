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
        'creator_id',
        'status',
        'tracking_number',
        'carrier',
        'shipped_at',
        'received_at'
    ];

    protected $casts = [
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
}