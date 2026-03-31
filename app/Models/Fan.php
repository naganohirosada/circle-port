<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'status',
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

    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}