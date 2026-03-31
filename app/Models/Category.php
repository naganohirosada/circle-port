<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class);
    }

    public function translations()
    {
        return $this->hasMany(CategoryTranslation::class);
    }

    // 現在のロケール、またはフォールバックの翻訳を取得するアクセサ
    public function getNameAttribute()
    {
        $locale = app()->getLocale();
        $translation = $this->translations->where('locale', $locale)->first() 
                    ?? $this->translations->where('locale', 'en')->first(); // なければ英語
                    
        return $translation ? $translation->name : $this->name_ja; // 最終手段でja
    }
}
