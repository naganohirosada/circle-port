<?php
namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes, Relations\HasMany};
use Spatie\MediaLibrary\{HasMedia, InteractsWithMedia};
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    // --- ステータス定数の定義 ---
    const STATUS_DRAFT = 1;      // 下書き
    const STATUS_PUBLISHED = 2;  // 公開中（ファンに見える状態）
    const STATUS_PRIVATE = 3;    // 非公開（クリエイターのみ見れる）
    const STATUS_SOLD_OUT = 9;   // 完売・取り扱い終了

    protected $fillable = [
        'creator_id',
        'category_id',
        'sub_category_id',
        'hs_code_id', 
        'sku',
        'has_variants',
        'price',
        'stock_quantity',
        'weight_g',
        'status',
    ];
    // 翻訳データとのリレーション
    public function translations(): HasMany {
        return $this->hasMany(ProductTranslation::class);
    }

    // バリエーションとのリレーション
    public function variations(): HasMany {
        return $this->hasMany(ProductVariant::class);
    }

    // 日本語の名前をサクッと取得するためのアクセサ
    public function getNameJaAttribute() {
        return $this->translations()->where('locale', 'ja')->first()?->name;
    }

    // app/Models/Product.php
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    // ヘルパー：メイン画像を取得、なければ最初の画像
    public function getPrimaryImageAttribute()
    {
        return $this->images->where('is_primary', true)->first() ?? $this->images->first();
    }

    /**
     * カテゴリ（親）へのリレーション
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * サブカテゴリへのリレーション
     */
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }

    /**
     * HSコードへのリレーション
     */
    public function hs_code()
    {
        return $this->belongsTo(HsCode::class);
    }

    /**
     * クリエイター（ユーザー）とのリレーション
     */
    public function creator()
    {
        return $this->belongsTo(Creator::class, 'creator_id');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_product')
                    ->withPivot('sort_order')
                    ->withTimestamps();
    }
}