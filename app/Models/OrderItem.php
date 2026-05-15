<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'unit_price',
    ];

    public function order(): BelongsTo 
    {
        return $this->belongsTo(Order::class);
    }
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * バリエーションへのリレーション
     * フロントエンドで product_variant としてアクセスされるため、この名称にします
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * 互換性のためのエイリアス
     */
    public function variation()
    {
        return $this->productVariant();
    }

    public function internationalShippingItem(): HasOne
    {
        return $this->hasOne(InternationalShippingItem::class);
    }
}