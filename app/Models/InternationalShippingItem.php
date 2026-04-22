<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternationalShippingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'international_shipping_id',
        'order_item_id',
        'quantity',
    ];

    /**
     * リレーション: 親となる国際配送
     */
    public function internationalShipping()
    {
        return $this->belongsTo(InternationalShipping::class);
    }

    /**
     * リレーション: 紐づく注文明細
     * これにより、商品名や価格、クリエイター情報にアクセスできます
     */
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}