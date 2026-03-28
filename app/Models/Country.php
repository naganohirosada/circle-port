<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name_en',
        'name_ja',
        'code', // ISO 3166-1 alpha-2 code
    ];
}
