<?php

namespace App\Services\Creator;

use App\Models\Creator;
use App\Models\Language;
use App\Repositories\Interfaces\CreatorRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Services\AI\TranslationService;

class CreatorService
{
    protected $repository;
    protected $translator;

    public function __construct(
        CreatorRepositoryInterface $repository,
        TranslationService $translator
    ) {
        $this->repository = $repository;
        $this->translator = $translator;
    }

    public function updateProfile(Creator $creator, array $params): void
    {
        DB::transaction(function () use ($creator, $params) {
            // 1. 画像の物理保存とパスの更新
            if (isset($params['profile_image'])) {
                $params['profile_image'] = $this->uploadImage($creator->profile_image, $params['profile_image'], 'creators/profile');
            }
            if (isset($params['cover_image'])) {
                $params['cover_image'] = $this->uploadImage($creator->cover_image, $params['cover_image'], 'creators/cover');
            }

            // 2. 本体テーブル (creators) の更新
            $creatorData = array_intersect_key($params, array_flip([
                'name', 'email', 'shop_name', 'profile', 
                'profile_image', 'cover_image',
                'x_id', 'pixiv_id', 'bluesky_id', 'instagram_id', 'booth_url', 'fanbox_url' // 追加
            ]));
            $this->repository->update($creator, $creatorData);

            // 3. 全言語への自動翻訳と保存
            $this->handleMultiLanguageTranslations($creator, $params['name'], $params['profile']);
        });
    }

    /**
     * languagesテーブルの全言語に対して翻訳・保存を実行
     */
    private function handleMultiLanguageTranslations(Creator $creator, string $name, ?string $profile): void
    {
        $languages = Language::all();
        $currentLocale = app()->getLocale();

        foreach ($languages as $lang) {
            $targetLocale = $lang->code; // 例: 'en', 'ko', 'zh'

            if ($targetLocale === $currentLocale) {
                // 現在の言語はそのまま保存
                $translatedName = $name;
                $translatedProfile = $profile;
            } else {
                // 他の言語はDeepL APIで翻訳
                // DeepLの仕様に合わせてロケールコードを調整（例: en -> EN-US）
                $deepLLocale = $this->mapToDeepLLocale($targetLocale);
                
                $translatedName = $this->translator->translate($name, $deepLLocale);
                $translatedProfile = $this->translator->translate($profile, $deepLLocale);
            }

            $this->repository->updateTranslation($creator, $targetLocale, [
                'name'    => $translatedName,
                'profile' => $translatedProfile,
            ]);
        }
    }

    /**
     * 画像の削除と保存処理
     */
    private function uploadImage(?string $oldPath, $newFile, string $dir): string
    {
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }
        return $newFile->store($dir, 'public');
    }

    private function mapToDeepLLocale(string $locale): string
    {
        $map = [
            'en' => 'EN-US',
            'ja' => 'JA',
            'ko' => 'KO',
            'zh' => 'ZH',
            'th' => 'TH',
            'fr' => 'FR',
        ];
        return $map[strtolower($locale)] ?? strtoupper($locale);
    }
}