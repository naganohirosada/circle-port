<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['name', 'postal_code', 'address', 'recipient_name', 'phone', 'is_active'];
}