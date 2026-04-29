<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreatorTranslation extends Model
{
    protected $fillable = [
        'creator_id',
        'locale',
        'name',
        'profile',
    ];

    /**
     * 親のクリエイターへのリレーション
     */
    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
}