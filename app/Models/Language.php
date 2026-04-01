<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    // テーブル名が 'languages' であることを確認
    protected $table = 'languages';
    
    // code カラムなどが fillable に入っているか
    protected $fillable = ['name', 'code', 'status', 'sort_order'];
}