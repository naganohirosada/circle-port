<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use SoftDeletes;

    // 決済タイプ定数
    const TYPE_CREDIT_CARD = 1;
    const TYPE_PAYPAL = 2;

    protected $fillable = [
        'fan_id', 'type', 'provider', 'provider_id', 
        'brand', 'last4', 'exp_month', 'exp_year', 
        'extra_details', 'is_default'
    ];

    protected $casts = [
        'extra_details' => 'array',
    ];

    public function fan()
    {
        return $this->belongsTo(Fan::class);
    }
}