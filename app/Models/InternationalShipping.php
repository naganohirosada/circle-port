<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\InternationalShippingStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternationalShipping extends Model
{
    protected $fillable = [
        'fan_id', 'address_id', 'carrier_id', 'tracking_number', 
        'status', 'total_weight', 'shipping_fee', 'dimensions', 'shipped_at'
    ];

    protected $casts = [
        'status' => InternationalShippingStatus::class,
        'dimensions' => 'array',
        'shipped_at' => 'datetime',
    ];

    /**
     * 送り先のファン
     */
    public function fan(): BelongsTo
    {
        return $this->belongsTo(Fan::class);
    }

    /**
     * 配送先住所 (これが不足していた原因です)
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    /**
     * 配送業者
     */
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }

    /**
     * 国際配送に含まれるアイテム（明細）
     */
    public function items(): HasMany
    {
        return $this->hasMany(InternationalShippingItem::class);
    }
}