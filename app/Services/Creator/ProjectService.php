<?php

namespace App\Services\Creator;

use App\Models\Project;
use App\Models\ProjectAnnouncement;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Support\Facades\DB;
use App\Models\Country;
use App\Services\AI\TranslationService;

class ProjectService
{
    /**
     * リポジトリインターフェースを注入
     */
    public function __construct(
        protected ProjectRepositoryInterface $projectRepo,
        protected TranslationService $translator
    ) {}

    /**
     * プロジェクトの新規作成・更新
     * 憲法：トランザクション内でDB整合性と翻訳を担保
     */
    public function saveProject(array $data, ?int $projectId = null)
    {
        return DB::transaction(function () use ($data, $projectId) {
            // 1. プロジェクト本体の基本情報を保存
            $projectData = [
                'creator_id'    => auth()->id(),
                'target_amount' => $data['target_amount'],
                'delivery_date' => $data['delivery_date'],
                'end_date'      => $data['end_date'],
                'status'        => $data['status'] ?? Project::STATUS_DRAFT,
            ];
            
            $project = $this->projectRepo->updateOrCreate($projectData, $projectId);

            // 2. 翻訳情報の保存（DeepL自動翻訳を含む）
            $this->saveTranslations($project, [
                'title'       => $data['title'],
                'description' => $data['description']
            ]);

            // 3. 商品の紐付け更新
            if (isset($data['product_ids'])) {
                $this->projectRepo->syncProducts($project->id, $data['product_ids']);
            }

            return $project;
        });
    }

    /**
     * 翻訳情報の保存ロジック（多言語自動展開）
     */
    private function saveTranslations(Project $project, array $content)
    {
        // ① まずは日本語（マスター）を保存
        $this->projectRepo->updateTranslation($project->id, 'ja', [
            'title'       => $content['title'],
            'description' => $content['description']
        ]);

        // ② 有効な国から「日本語以外」の言語リストを抽出
        $targetLocales = Country::where('status', 1)
            ->where('lang_code', '!=', 'ja')
            ->pluck('lang_code')
            ->unique();

        // ③ 各言語ごとに自動翻訳を実行して保存
        foreach ($targetLocales as $locale) {
            // DeepL API等の要件に合わせて大文字に変換 (例: en -> EN)
            $targetLang = strtoupper($locale);

            $this->projectRepo->updateTranslation($project->id, $locale, [
                'title'       => $this->translator->translate($content['title'], $targetLang),
                'description' => $this->translator->translate($content['description'], $targetLang),
            ]);
        }
    }

    /**
     * お届け予定日の延長ロジック
     * 日付更新と同時に「重要アナウンス」を強制生成する仕様
     */
    public function extendDeliveryDate(Project $project, $newDate, $reason)
    {
        return DB::transaction(function () use ($project, $newDate, $reason) {
            // 1. プロジェクト本体の予定日を更新
            $this->projectRepo->updateOrCreate(['delivery_date' => $newDate], $project->id);

            // 2. 自動的に「期間延長アナウンス」を投稿
            $this->projectRepo->createAnnouncement([
                'project_id'   => $project->id,
                'creator_id'   => $project->creator_id,
                'title'        => "【重要】お届け予定日の変更についてのお知らせ",
                'content'      => "お届け予定日を " . $newDate . " に変更いたしました。\n\n【理由】\n" . $reason,
                'type'         => ProjectAnnouncement::TYPE_EXTENSION,
                'published_at' => now(),
            ]);
        });
    }
}