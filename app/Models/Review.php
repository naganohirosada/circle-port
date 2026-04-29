<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'fan_id',
        'rating',
        'comment',
        'is_published'
    ];

    protected $casts = [
        'images' => 'array', // JSONデータを配列として扱う
    ];

    /**
     * このレビューを投稿したユーザー
     */
    public function fan()
    {
        return $this->belongsTo(Fan::class);
    }

    /**
     * レビュー対象の商品
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * レビュー画像とのリレーション
     */
    public function images()
    {
        // ReviewImageモデルとの1対多のリレーション
        return $this->hasMany(ReviewImage::class);
    }

    /**
     * 翻訳データとのリレーション
     */
    public function translations()
    {
        return $this->hasMany(ReviewTranslation::class);
    }
}