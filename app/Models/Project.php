<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'creator_id',
        'title',
        'description',
        'target_amount',
        'current_amount',
        'status',
        'delivery_date',
        'end_date',
    ];

    // ステータス定数
    const STATUS_DRAFT = 10;
    const STATUS_ACTIVE = 20;
    const STATUS_SUCCESS = 30;
    const STATUS_CLOSED = 40;
    const STATUS_CANCELLED = 50;

    /**
     * このプロジェクトを作成したクリエイター（ユーザー）
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * このプロジェクトに紐付く進捗アナウンス
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(ProjectAnnouncement::class);
    }

    /**
     * プロジェクトの全翻訳情報を取得
     */
    public function translations(): HasMany
    {
        return $this->hasMany(ProjectTranslation::class);
    }

    /**
     * 指定した言語（または現在の言語）の翻訳を1つ取得するヘルパー
     */
    public function translation($locale = null)
    {
        $locale = $locale ?: app()->getLocale();
        return $this->translations()->where('locale', $locale)->first();
    }

    public function products(): BelongsToMany
    {
        // withPivotで中間テーブルの追加カラム(sort_order)も取得できるようにする
        return $this->belongsToMany(Product::class, 'project_product')
                    ->withPivot('sort_order')
                    ->withTimestamps()
                    ->orderBy('project_product.sort_order', 'asc');
    }
}