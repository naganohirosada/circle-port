<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VariantTranslation extends Model
{
    public $timestamps = false;
    protected $fillable = ['product_variant_id', 'locale', 'variant_name', 'description'];
}