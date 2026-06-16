<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payout extends Model
{
    protected $fillable = [
        'creator_id',
        'amount',
        'status',
        'scheduled_date',
        'paid_at',
        'admin_notes',
    ];

    // ステータス定数
    const STATUS_PENDING = 10; // 支払い待ち
    const STATUS_PROCESSING = 20; // 支払い処理中
    const STATUS_PAID = 30; // 支払い完了
    const STATUS_CANCELLED = 90; // 支払いキャンセル

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Creator::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PayoutDetail::class);
    }
}