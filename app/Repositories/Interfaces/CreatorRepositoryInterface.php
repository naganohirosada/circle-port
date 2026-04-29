<?php

namespace App\Repositories\Interfaces;

use App\Models\Creator;

interface CreatorRepositoryInterface
{
    public function getGroupOrders(int $creatorId);
    public function getRecentRegularOrders(int $creatorId, int $limit = 10);
    public function getTotalEarnings(int $creatorId);
    public function getItemSalesTotal(int $creatorId);
    public function update(Creator $creator, array $data): bool;
    public function updateTranslation(Creator $creator, string $locale, array $data): void;
}