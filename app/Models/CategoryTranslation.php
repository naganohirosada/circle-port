<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryTranslation extends Model
{
    // 一括保存を許可するカラム
    protected $fillable = ['category_id', 'locale', 'name'];

    // 親カテゴリーへのリレーション
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}