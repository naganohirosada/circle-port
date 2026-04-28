<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductTag extends Pivot
{
    /**
     * テーブル名の明示
     * 慣習(アルファベット順: product_tag)に従っている場合は省略可能
     */
    protected $table = 'product_tag';

    /**
     * 中間テーブルのIDを自動増分にする場合
     */
    public $incrementing = true;

    // タイムスタンプを扱う場合
    public $timestamps = true;
}