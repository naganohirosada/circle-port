<?php

namespace App\Services\Creator;

use App\Models\Project;
use App\Models\ProjectAnnouncement;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Country;
use App\Services\AI\TranslationService;

class ProjectAnnouncementService
{
    public function __construct(
        protected ProjectRepositoryInterface $projectRepo,
        protected TranslationService $translator
    ) {}

    /**
     * プロジェクトに紐づく全アナウンスを取得
     */
    public function getList(Project $project)
    {
        return $this->projectRepo->getAnnouncementsByProjectId($project->id);
    }

    /**
     * 新規アナウンスを投稿
     */
    public function post(Project $project, array $data)
    {
        return DB::transaction(function () use ($project, $data) {
            // ① タイプを文字列から数値へマッピング（エラー解決）
            $typeMap = [
                'update'    => ProjectAnnouncement::TYPE_UPDATE,
                'report'    => ProjectAnnouncement::TYPE_REPORT,
                'important' => ProjectAnnouncement::TYPE_IMPORTANT,
            ];

            $announcementData = [
                'project_id'   => $project->id,
                'creator_id'   => Auth::id(),
                'type'         => $typeMap[$data['type']] ?? ProjectAnnouncement::TYPE_UPDATE,
                'published_at' => now(),
            ];

            // ② 画像の保存処理
            $imagePaths = [];
            if (isset($data['images'])) {
                foreach ($data['images'] as $image) {
                    $imagePaths[] = $image->store('announcements', 'public');
                }
            }

            // ③ 本体と画像を保存
            $announcement = $this->projectRepo->createAnnouncement($announcementData, $imagePaths);

            // ④ 翻訳情報の保存（多言語展開）
            $this->saveAnnouncementTranslations($announcement, [
                'title'   => $data['title'],
                'content' => $data['content']
            ]);

            return $announcement;
        });
    }

    /**
     * アナウンスの自動翻訳保存
     */
    private function saveAnnouncementTranslations(ProjectAnnouncement $pa, array $content)
    {
        // 日本語マスターの保存
        $this->projectRepo->updateAnnouncementTranslation($pa->id, 'ja', $content);

        // 有効な他言語の取得
        $targetLocales = Country::where('status', 1)
            ->where('lang_code', '!=', 'ja')
            ->pluck('lang_code')
            ->unique();

        // 翻訳と保存
        foreach ($targetLocales as $locale) {
            $targetLang = strtoupper($locale);

            $this->projectRepo->updateAnnouncementTranslation($pa->id, $locale, [
                'title'   => $this->translator->translate($content['title'], $targetLang),
                'content' => $this->translator->translate($content['content'], $targetLang),
            ]);
        }
    }
}