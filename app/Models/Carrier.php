<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carrier extends Model
{
    // 憲法第1条：一括割り当てを許可するカラムを指定
    protected $fillable = ['name', 'is_active', 'tracking_url'];

    /**
     * この業者が担当する配送プラン一覧を取得
     */
    public function domesticShippings(): HasMany
    {
        return $this->hasMany(DomesticShipping::class);
    }
}