<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAnnouncementImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_announcement_id',
        'path',
        'sort_order',
    ];

    /**
     * 親のアナウンスへのリレーション
     */
    public function announcement(): BelongsTo
    {
        return $this->belongsTo(ProjectAnnouncement::class, 'project_announcement_id');
    }
}