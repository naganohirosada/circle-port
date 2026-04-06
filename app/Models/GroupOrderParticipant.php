<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupOrderParticipant extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    // 数値として扱うキャスト設定
    protected $casts = [
        'is_primary_paid' => 'boolean',
        'is_secondary_paid' => 'boolean',
        'secondary_amount_share' => 'decimal:2',
    ];

    /**
     * 参加しているグループオーダー
     */
    public function groupOrder(): BelongsTo
    {
        return $this->belongsTo(GroupOrder::class);
    }

    /**
     * 参加者(ユーザー)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 一次決済注文レコード
     */
    public function primaryOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'primary_order_id');
    }

    /**
     * 二次決済注文レコード
     */
    public function secondaryOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'secondary_order_id');
    }
}