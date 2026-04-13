<?php
namespace App\Repositories\Interfaces;

interface SalesRepositoryInterface
{
    /**
     * 指定期間または全期間の決済成功済みデータを取得
     * @param int $creatorId
     */
    public function getSuccessfulPaymentsByCreator(int $creatorId);
}