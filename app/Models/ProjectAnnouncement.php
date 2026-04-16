<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectAnnouncement extends Model
{
    use SoftDeletes;

    protected $fillable = ['project_id', 'creator_id', 'type', 'published_at'];

    const TYPE_UPDATE = 10;    // 進捗状況
    const TYPE_REPORT = 20;    // 完了報告
    const TYPE_IMPORTANT = 30; // 重要
    const TYPE_EXTENSION = 40; // 期間延長（自動生成用）

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function creator() {
        return $this->belongsTo(Creator::class, 'creator_id');
    }

    public function images()
    {
        return $this->hasMany(ProjectAnnouncementImage::class)->orderBy('sort_order');
    }

    public function translations()
    {
        return $this->hasMany(ProjectAnnouncementTranslation::class);
    }
}