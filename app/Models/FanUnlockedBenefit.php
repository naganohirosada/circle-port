<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FanUnlockedBenefit extends Model
{
    use HasFactory;

    protected $table = 'fan_unlocked_benefits';

    protected $fillable = [
        'fan_id',
        'order_id',
        'tip_benefit_id',
        'unlocked_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
    ];

    /**
     * 特典を解放した海外ファン（ユーザー）へのリレーション
     */
    public function fan(): BelongsTo
    {
        return $this->belongsTo(Fan::class);
    }

    /**
     * 対象となった注文（オーダー）へのリレーション
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * 解放された特典マスターへのリレーション
     */
    public function tipBenefit(): BelongsTo
    {
        return $this->belongsTo(TipBenefit::class, 'tip_benefit_id');
    }
}