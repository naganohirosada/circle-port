<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use SoftDeletes;

    // 憲法：ステータスの数値管理
    const STATUS_PENDING = 10;                // 支払い待ち
    const STATUS_PAID = 20;                   // 支払い完了（受注）
    const STATUS_SHIPPED_TO_WAREHOUSE = 30;   // クリエイターから倉庫へ発送中
    const STATUS_ARRIVED_AT_WAREHOUSE = 40;   // 倉庫に到着（検品済）
    const STATUS_COMPLETED = 50;              // 全工程完了
    const STATUS_CANCELLED = 90;              // キャンセル

    protected $fillable = [
        'fan_id',
        'address_id',
        'payment_method_id',
        'total_amount',
        'currency_id',
        'status',
        'notes',
    ];

    // リレーション
    public function fan(): BelongsTo 
    {
        return $this->belongsTo(Fan::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}