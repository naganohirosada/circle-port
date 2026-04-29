<?php
namespace App\Services\Fan;

use App\Repositories\Interfaces\ReviewRepositoryInterface;
use App\Services\AI\TranslationService;
use App\Models\Language;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\App;
use App\Models\Review;

class ReviewService {
    protected $repository;
    protected $translationService;

    public function __construct(
        ReviewRepositoryInterface $repository,
        TranslationService $translationService
    ) {
        $this->repository = $repository;
        $this->translationService = $translationService;
    }

    public function storeReview(int $productId, int $fanId, array $params): Review
    {
        return DB::transaction(function () use ($productId, $fanId, $params) {
            // 1. レビュー本体の保存
            $review = $this->repository->create([
                'product_id' => $productId,
                'fan_id'    => $fanId,
                'rating'     => $params['rating'],
                'is_published' => true,
            ]);

            // 2. コメントの全言語翻訳と保存
            if (!empty($params['comment'])) {
                $currentLocale = App::getLocale();
                
                // まずは投稿された元の言語として保存
                $this->repository->saveTranslation($review->id, $currentLocale, $params['comment']);

                // languageテーブルから有効な全言語を取得
                $targetLanguages = Language::all();

                foreach ($targetLanguages as $lang) {
                    $targetLocale = (string)$lang->code;

                    // 投稿時の言語と同じ、または空の場合はスキップ
                    if (empty($targetLocale) || $targetLocale === $currentLocale) {
                        continue;
                    }

                    // 各言語へ翻訳
                    $translatedComment = $this->translationService->translate(
                        (string)$params['comment'], 
                        $targetLocale
                    );

                    // 翻訳結果を保存
                    $this->repository->saveTranslation(
                        $review->id, 
                        $targetLocale, 
                        $translatedComment
                    );
                }
            }

            // 3. 画像の保存
            if (isset($params['images'])) {
                foreach ($params['images'] as $image) {
                    $path = $image->store('reviews/' . $productId, 'public');
                    $this->repository->addImage($review->id, $path);
                }
            }

            return $review;
        });
    }
}