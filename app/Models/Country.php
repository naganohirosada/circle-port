<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'iso_code', 
        'currency_code',
        'lang_code',
        'vat_rate',
        'status'
    ];

    /**
     * 国の多言語翻訳（リレーション
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function translations()
    {
        return $this->hasMany(CountryTranslation::class);
    }

    /**
     * 現在のロケール、またはフォールバック言語の翻訳を取得するヘルパー
     * @param string $locale
     * @return string
     */
    public function getTranslatedName(string $locale): string
    {
        $translation = $this->translations->where('locale', $locale)->first() 
                    ?? $this->translations->where('locale', 'en')->first() 
                    ?? $this->translations->first();
                    
        // 憲法：name_ja は削除済みなので、最終的なフォールバックは iso_code（JP等）にする
        return $translation ? $translation->name : $this->iso_code;
    }
}
