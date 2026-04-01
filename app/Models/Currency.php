<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    // 憲法：一括割り当てを許可するカラムを明示
    protected $fillable = [
        'code',       // USD, JPY
        'name',       // US Dollar, 日本円
        'symbol',     // $, ¥
        'status',     // 1:有効, 0:無効
        'sort_order'
    ];

    /**
     * この通貨を優先設定しているファンたち
     */
    public function fans(): HasMany
    {
        return $this->hasMany(Fan::class);
    }
}