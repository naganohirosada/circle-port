<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use SoftDeletes;

    // 憲法：ステータス定数
    const IS_DEFAULT = 1;
    const NOT_DEFAULT = 0;

    protected $fillable = [
        'fan_id',
        'country_id',
        'name',
        'phone',
        'postal_code',
        'state',
        'city',
        'address_line1',
        'address_line2',
        'is_default',
    ];

    /**
     * 憲法：国はテーブル管理（リレーション）
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * 所有ユーザーへのリレーション
     */
    public function fan(): BelongsTo
    {
        return $this->belongsTo(Fan::class);
    }

    /**
     * デフォルト住所かどうかの判定スコープ
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', self::IS_DEFAULT);
    }
}