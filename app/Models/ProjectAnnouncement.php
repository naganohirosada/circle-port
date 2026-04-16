<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectAnnouncement extends Model
{
    use SoftDeletes;

    protected $fillable = ['project_id', 'creator_id', 'title', 'content', 'type', 'published_at'];

    // タイプ定数
    const TYPE_NEWS = 10;
    const TYPE_PROGRESS = 20;
    const TYPE_EXTENSION = 30;

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function creator() {
        return $this->belongsTo(Creator::class, 'creator_id');
    }
}