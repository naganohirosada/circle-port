<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentBreakdown extends Model
{
    use SoftDeletes;

    // 内訳タイプ
    const TYPE_ITEM_TOTAL = 1;      // 商品代金合計
    const TYPE_DOMESTIC_SHIPPING = 2; // 国内送料（クリエイター→倉庫）
    const TYPE_INTL_SHIPPING = 3;   // 国際送料
    const TYPE_HANDLING_FEE = 4;    // システム利用料・手数料
    const TYPE_TAX = 5;             // 税金
    const TYPE_DISCOUNT = 6;        // 割引・クーポン

    protected $table = 'payment_breakdown';

    protected $fillable = [
        'payment_id',
        'type',
        'amount',
        'currency_id',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}