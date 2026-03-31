<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    protected $fillable = ['category_id', 'name_ja', 'name_en', 'sort_order'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function translations()
    {
        return $this->hasMany(SubCategoryTranslation::class);
    }
}
