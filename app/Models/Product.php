<?php
namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes, Relations\HasMany};
use Spatie\MediaLibrary\{HasMedia, InteractsWithMedia};
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    // --- ステータス定数 ---
    const STATUS_DRAFT = 1;      // 下書き
    const STATUS_PUBLISHED = 2;  // 公開中
    const STATUS_PRIVATE = 3;    // 非公開
    const STATUS_PENDING = 5;    // 承認待ち（★追加：クリエイターが申請した状態）
    const STATUS_REJECTED = 6;   // 却下（★追加：運営が差し戻した状態）
    const STATUS_SOLD_OUT = 9;   // 完売

    // 作品タイプの定数
    const TYPE_PHYSICAL = 1; // 現物作品
    const TYPE_DIGITAL = 2;  // デジタル作品

    protected $fillable = [
        'creator_id',
        'category_id',
        'sub_category_id',
        'product_type',
        'hs_code_id', 
        'sku',
        'has_variants',
        'price',
        'stock_quantity',
        'weight_g',
        'status',
        'published_at',
        'digital_file_path',
        'rejection_reason',
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

    /**
     * 商品に紐付くタグ一覧（多対多）
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)
                    ->using(ProductTag::class) // カスタムモデルを使用
                    ->withTimestamps();        // タイムスタンプを自動更新
    }

    /**
     * デジタル作品かどうかを判定するアクセサ
     */
    public function isDigital(): bool
    {
        return (int)$this->product_type === self::TYPE_DIGITAL;
    }

    /**
     * この商品に寄せられたレビュー一覧
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * 平均評価（星）の算出
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?: 0;
    }
}