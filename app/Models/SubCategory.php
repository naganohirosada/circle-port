<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function defaultHsCode(): BelongsTo
    {
        return $this->belongsTo(HsCode::class, 'default_hs_code_id');
    }
}
