<?php
namespace App\Models;

use Illuminate\Database\Eloquent\{Model, SoftDeletes, Relations\HasMany, Relations\BelongsTo};

class ProductVariant extends Model
{
    use SoftDeletes;
    protected $fillable = ['product_id', 'price', 'stock_quantity', 'weight_g', 'sku', 'hs_code_id', 'digital_file_path'];

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class);
    }

    public function translations(): HasMany {
        return $this->hasMany(VariantTranslation::class);
    }

    /**
     * HSコードとのリレーション
     */
    public function hsCode(): BelongsTo
    {
        return $this->belongsTo(HsCode::class);
    }
}