<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewTranslation extends Model
{
    protected $fillable = ['review_id', 'locale', 'comment'];

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}