<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\Creator\StoreProjectAnnouncementRequest;
use App\Services\Creator\ProjectAnnouncementService; // Serviceを注入
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectAnnouncementController extends Controller
{
    public function __construct(
        protected ProjectAnnouncementService $announcementService
    ) {}

    /**
     * アナウンス一覧表示
     */
    public function index(Project $project)
    {
        if ($project->creator_id !== Auth::id()) abort(403);

        return Inertia::render('Creator/Project/Announcement/Index', [
            'project'       => $project->load('translations'),
            'announcements' => $this->announcementService->getList($project),
        ]);
    }

    /**
     * アナウンス投稿
     */
    public function store(StoreProjectAnnouncementRequest $request, Project $project)
    {
        if ($project->creator_id !== Auth::id()) abort(403);

        $this->announcementService->post($project, $request->validated());

        return back()->with('success', '進捗報告を公開しました！');
    }
}