<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fan extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    const STATUS_INACTIVE = 0;
    const STATUS_ACTIVE = 1;
    const STATUS_BANNED = 9;

    protected $fillable = [
        'name',
        'email',
        'password',
        'country_id',
        'language_id',
        'currency_id',
        'timezone_id',
        'status',
        'unique_id',
        'stripe_customer_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'integer',
        ];
    }

/**
     * 言語マスタとのリレーション
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    /**
     * 通貨マスタとのリレーション
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * 国マスタとのリレーション
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * タイムゾーンマスタとのリレーション
     */
    public function timezone(): BelongsTo
    {
        return $this->belongsTo(Timezone::class);
    }

    public function shippingAddresses() {
        return $this->hasMany(Address::class);
    }

    public function paymentMethods() {
        return $this->hasMany(PaymentMethod::class);
    }
}