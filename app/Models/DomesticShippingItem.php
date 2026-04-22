<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomesticShippingItem extends Model
{
    use SoftDeletes; // 憲法：論理削除

    protected $fillable = [
        'domestic_shipping_id',
        'product_id',
        'product_variant_id',
        'order_item_id',
        'quantity'
    ];

    public function domesticShipping(): BelongsTo
    {
        return $this->belongsTo(DomesticShipping::class);
    }

    /**
     * 注文明細へのリレーション
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variation(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}