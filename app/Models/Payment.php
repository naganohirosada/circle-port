<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use SoftDeletes;

    // 決済ステータス
    const STATUS_PENDING = 10;
    const STATUS_SUCCEEDED = 20;
    const STATUS_FAILED = 30;
    const STATUS_REFUNDED = 40;

    // 決済手段
    const METHOD_CARD = 1;
    const METHOD_PAYPAL = 2;
    const METHOD_ALIPAY = 3;

    protected $fillable = [
        'order_id',
        'external_transaction_id',
        'total_amount',
        'currency_id',
        'status',
        'method_type',
    ];

    protected $casts = [
        'status' => \App\Enums\PaymentStatus::class,
        'method_type' => \App\Enums\PaymentMethodType::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function breakdowns(): HasMany
    {
        return $this->hasMany(PaymentBreakdown::class);
    }
}