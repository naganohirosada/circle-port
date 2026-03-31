<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HsCode extends Model
{
    use HasFactory;

    // 一括書き込みを許可するカラムを指定
    protected $fillable = [
        'code',
        'name_ja',
        'name_en',
        'category_id'
    ];

    /**
     * カテゴリとのリレーション（任意）
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}