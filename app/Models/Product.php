<?php
namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes, Relations\HasMany};
use Spatie\MediaLibrary\{HasMedia, InteractsWithMedia};

class Product extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    protected $fillable = ['creator_id', 'category_id', 'has_variants', 'price', 'stock_quantity', 'weight_g', 'sku', 'status'];

    // 翻訳データとのリレーション
    public function translations(): HasMany {
        return $this->hasMany(ProductTranslation::class);
    }

    // バリエーションとのリレーション
    public function variants(): HasMany {
        return $this->hasMany(ProductVariant::class);
    }

    // 日本語の名前をサクッと取得するためのアクセサ
    public function getNameJaAttribute() {
        return $this->translations()->where('locale', 'ja')->first()?->name;
    }
}