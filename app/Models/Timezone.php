<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Timezone extends Model
{
    protected $fillable = [
        'identifier',   // Asia/Tokyo
        'display_name', // (GMT+09:00) Tokyo
        'utc_offset',   // 32400
        'status',       // 1:有効, 0:無効
        'sort_order'
    ];

    /**
     * このタイムゾーンを持つファンたち
     */
    public function fans(): HasMany
    {
        return $this->hasMany(Fan::class);
    }
}