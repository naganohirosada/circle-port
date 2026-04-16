<?php

namespace App\Repositories\Eloquent\Creator;

use App\Models\Project;
use App\Models\ProjectAnnouncement;
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

    public function createAnnouncement(array $announcementData): void
    {
        ProjectAnnouncement::create($announcementData);
    }

    public function findById(int $id): Project
    {
        return Project::findOrFail($id);
    }
}