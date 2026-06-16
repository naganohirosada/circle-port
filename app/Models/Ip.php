<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ip extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'guideline_url',
        'max_sale_limit',
        'is_active',
    ];

    /**
     * このIPに属する作品一覧へのリレーション
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'ip_id');
    }
}