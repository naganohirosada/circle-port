<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    protected $fillable = [
        'fan_id',
        'creator_id',
    ];

    /**
     * フォローしているユーザー（ファン）
     */
    public function follower()
    {
        return $this->belongsTo(User::class, 'fan_id');
    }

    /**
     * フォローされているユーザー（クリエイター）
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}