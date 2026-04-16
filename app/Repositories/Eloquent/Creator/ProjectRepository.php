<?php

namespace App\Repositories\Eloquent\Creator;

use App\Models\Project;
use App\Models\ProjectAnnouncement;
use App\Models\ProjectAnnouncementTranslation;
use App\Repositories\Interfaces\ProjectRepositoryInterface;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function updateOrCreate(array $data, ?int $id = null): Project
    {
        return Project::updateOrCreate(['id' => $id], $data);
    }

    public function updateTranslation(int $projectId, string $locale, array $translationData): void
    {
        $project = Project::findOrFail($projectId);
        $project->translations()->updateOrCreate(
            ['locale' => $locale],
            $translationData
        );
    }

    public function syncProducts(int $projectId, array $productIds): void
    {
        $project = Project::findOrFail($projectId);
        $project->products()->sync($productIds);
    }

    public function createAnnouncement(array $data, array $images = []): ProjectAnnouncement
    {
        $announcement = ProjectAnnouncement::create($data);

        // 2. 画像の保存
        foreach ($images as $index => $path) {
            $announcement->images()->create([
                'path' => $path,
                'sort_order' => $index
            ]);
        }

        return $announcement;
    }

    /**
     * アナウンスの翻訳情報を保存
     */
    public function updateAnnouncementTranslation(int $paId, string $locale, array $translationData): void
    {
        ProjectAnnouncementTranslation::updateOrCreate(
            ['project_announcement_id' => $paId, 'locale' => $locale],
            $translationData
        );
    }

    public function findById(int $id): Project
    {
        return Project::findOrFail($id);
    }

    public function getAnnouncementsByProjectId(int $projectId)
    {
        return ProjectAnnouncement::where('project_id', $projectId)
            ->with(['translations', 'images'])
            ->latest()
            ->get();
    }
}