<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTranslation extends Model
{
    public $timestamps = false; // 翻訳テーブルには不要なことが多い
    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'description',
        'material',
    ];
}