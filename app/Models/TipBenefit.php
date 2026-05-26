<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\FanUnlockedBenefit;

class TipBenefit extends Model
{
    use HasFactory;

    protected $table = 'tip_benefits';

    protected $fillable = [
        'creator_id',
        'min_tip_amount',
        'benefit_title',
        'file_path',
        'file_mime',
    ];

    /**
     * 特典を登録したクリエイター（サークル）へのリレーション
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Creator::class);
    }

    /**
     * この特典を解放したファンたちの記録一覧へのリレーション
     */
    public function unlockedFans(): HasMany
    {
        return $this->hasMany(FanUnlockedBenefit::class);
    }
}