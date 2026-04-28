<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'is_active',
    ];

    /**
     * このタグを持つ商品一覧
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

	/**
     * 全言語の翻訳
     */
    public function translations()
    {
        return $this->hasMany(TagTranslation::class);
    }

    /**
     * 現在のロケール、または指定したロケールの名前を取得
     */
    public function getNameAttribute()
    {
        $locale = app()->getLocale();
        return $this->translations->where('locale', $locale)->first()?->name 
               ?? $this->translations->where('locale', 'ja')->first()?->name; // 日本語をフォールバックに
    }
}