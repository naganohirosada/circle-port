<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'images',
    ];

    protected $casts = [
        'images' => 'array', // JSONデータを配列として扱う
    ];

    /**
     * このレビューを投稿したユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * レビュー対象の商品
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}