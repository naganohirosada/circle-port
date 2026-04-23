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
    const STATUS_PENDING = 10;
    const STATUS_PROCESSING = 20;
    const STATUS_PAID = 30;
    const STATUS_CANCELLED = 90;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Creator::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PayoutDetail::class);
    }
}