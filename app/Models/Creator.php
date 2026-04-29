<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Creator extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'shop_name',
        'name',
        'email',
        'password',
        'profile',
        'profile_image',
        'cover_image',
        'x_id',
        'pixiv_id',
        'bluesky_id',
        'instagram_id',
        'booth_url',
        'fanbox_url',
        'bank_name',
        'branch_name',
        'account_type',
        'account_number',
        'account_holder',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * クリエイターに紐づく商品一覧を取得
     */
    public function products(): HasMany
    {
        // 第2引数には外部キー（例: creator_id）を指定します
        return $this->hasMany(Product::class, 'creator_id');
    }

    /**
     * クリエイターの商品の「注文明細」を取得
     * Creator -> Product -> OrderItem
     */
    public function orderItems(): HasManyThrough
    {
        return $this->hasManyThrough(OrderItem::class, Product::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    /**
     * 自分をフォローしてくれているファン一覧（フォロワー）
     */
    public function followers()
    {
        return $this->belongsToMany(
            User::class,    // 関連するモデル（ファンはUserモデル）
            'follows',      // 中間テーブル名
            'creator_id',   // 中間テーブル内での自分のID
            'fan_id'        // 中間テーブル内での相手（ファン）のID
        )->withTimestamps();
    }

    public function translations()
    {
        return $this->hasMany(CreatorTranslation::class);
    }

    // 現在の言語の翻訳を取得するためのヘルパー（オプション）
    public function currentTranslation()
    {
        return $this->hasOne(CreatorTranslation::class)->where('locale', app()->getLocale());
    }
}