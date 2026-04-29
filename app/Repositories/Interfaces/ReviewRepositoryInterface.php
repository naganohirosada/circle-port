<?php
namespace App\Repositories\Interfaces;

use App\Models\Review;

interface ReviewRepositoryInterface
{
    public function create(array $data): Review;
    public function addImage(int $reviewId, string $path): void;
    public function saveTranslation(int $reviewId, string $locale, string $comment): void;
}