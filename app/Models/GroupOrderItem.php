<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupOrderItem extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $fillable = [
        'group_order_id',
        'product_id',
        'product_variant_id',
        'item_name', // 募集時点の名前（スナップショット）
        'price',     // 募集時点の価格（スナップショット）
        'stock_limit',
    ];

    /**
     * 親のグループオーダー
     */
    public function groupOrder(): BelongsTo
    {
        return $this->belongsTo(GroupOrder::class);
    }

    /**
     * 対象の商品
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}