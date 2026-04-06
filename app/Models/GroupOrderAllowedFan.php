<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 中間テーブル用のモデル
 * Pivot クラスを継承させるのが一般的です
 */
class GroupOrderAllowedFan extends Pivot
{
    protected $table = 'group_order_allowed_fans';

    protected $fillable = [
        'group_order_id',
        'fan_id',
    ];

    /**
     * リレーション：対象のGO
     */
    public function groupOrder(): BelongsTo
    {
        return $this->belongsTo(GroupOrder::class);
    }

    /**
     * リレーション：対象のファン
     */
    public function fan(): BelongsTo
    {
        return $this->belongsTo(Fan::class);
    }
}