<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubCategoryTranslation extends Model
{
    protected $fillable = ['sub_category_id', 'locale', 'name'];

    // 親サブカテゴリーへのリレーション
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
}