<?php

namespace App\Repositories\Interfaces;

interface CreatorRepositoryInterface
{
    public function getGroupOrders(int $creatorId);
    public function getRecentRegularOrders(int $creatorId, int $limit = 10);
    public function getTotalEarnings(int $creatorId);
    public function getItemSalesTotal(int $creatorId);
}