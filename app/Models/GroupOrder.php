<?php
namespace App\Models;

use App\Enums\GroupOrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GroupOrder extends Model
{
    use SoftDeletes;

    // ステータス定数（憲法：数字で管理）
    const DRAFT = 0;           // 下書き
    const RECRUITING = 1;      // 募集中
    const CLOSED = 2;          // 募集終了
    const ORDERED = 3;         // 発注済み
    const ARRIVED = 4;         // 拠点到着
    const SHIPPING = 5;        // 配送中
    const COMPLETED = 6;       // 完了
    const CANCELLED = 9;       // キャンセル

    // primary_payment_status
    const PAYMENT_STATUS_PENDING = 1;
    const PAYMENT_STATUS_PROCESSING = 2;
    const PAYMENT_STATUS_COMPLETED = 3;
    const PAYMENT_STATUS_FAILED = 4;

    protected $guarded = ['id'];

    protected $fillable = [
        'creator_id',
        'manager_id', // 主催者ID
        'title',
        'description',
        'status',
        'recruitment_start_date',
        'recruitment_end_date',
        'shipping_mode',
        'is_private',
        'is_secondary_payment_required',
    ];

    protected $casts = [
        'status' => GroupOrderStatus::class,
        'recruitment_start_date' => 'datetime',
        'recruitment_end_date' => 'datetime',
        'is_private' => 'boolean',
        'is_secondary_payment_required' => 'boolean',
        'primary_payment_status' => 'integer',
        'final_domestic_shipping_fee' => 'float',
    ];
    protected $appends = [
        'status_label',
        'status_color',
        'participants_count',
    ];

    public function organizer() {
        return $this->belongsTo(Fan::class, 'manager_id');
    }
    
    public function items() {
        return $this->hasMany(GroupOrderItem::class);
    }
    
    public function participants() {
        return $this->hasMany(GroupOrderParticipant::class);
    }

    public function shippingAddress() {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * リレーション：対象クリエイター
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Creator::class);
    }

    /**
     * リレーション：招待されたファン（限定公開用）
     */
    public function allowedFans(): BelongsToMany
    {
        return $this->belongsToMany(Fan::class, 'group_order_allowed_fans');
    }

    /**
     * 仮想属性：ステータスラベル
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    /**
     * 仮想属性：ステータスカラー
     */
    public function getStatusColorAttribute(): string
    {
        return $this->status->color();
    }

    /**
     * 
     */
    public function getParticipantsCountAttribute(): int
    {
        return $this->participants()->count();
    }
}