<?php
namespace App\Repositories\Eloquent\Fan;

use App\Models\Review;
use App\Models\ReviewImage;
use App\Models\ReviewTranslation;
use App\Repositories\Interfaces\ReviewRepositoryInterface;

class ReviewRepository implements ReviewRepositoryInterface
{
    public function create(array $data): Review
    {
        return Review::create($data);
    }

    public function addImage(int $reviewId, string $path): void
    {
        ReviewImage::create([
            'review_id'  => $reviewId,
            'image_path' => $path,
        ]);
    }

    public function saveTranslation(int $reviewId, string $locale, string $comment): void
    {
        ReviewTranslation::updateOrCreate(
            ['review_id' => $reviewId, 'locale' => $locale],
            ['comment' => $comment]
        );
    }
}