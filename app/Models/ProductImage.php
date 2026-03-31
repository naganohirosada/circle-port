<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'file_path',
        'sort_order',
        'is_primary',
    ];

    /**
     * 商品（親）へのリレーション
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * アクセサ：画像のフルURLを取得する
     * $image->url でアクセスできるようになります
     */
    public function getUrlAttribute(): string
    {
        return $this->file_path ? Storage::url($this->file_path) : '';
    }

    // JSON変換時に url を自動で含める設定
    protected $appends = ['url'];
}