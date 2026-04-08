<?php
namespace App\Services\Gom;

use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Jobs\ProcessPrimaryPaymentJob;

class PrimaryPaymentService {
    public function __construct(
        protected GroupOrderRepositoryInterface $repo
    ) {}

    public function requestPayment(int $goId): void
    {
        $go = $this->repo->findWithParticipantsForPayment($goId);

        // 管理者が送料を設定していない場合はエラー
        if (is_null($go->final_domestic_shipping_fee)) {
            throw new \Exception("Domestic shipping fee has not been set yet.");
        }

        // ステータスを 2: PROCESSING (処理中) に変更
        $this->repo->updateStatus($goId, ['primary_payment_status' => 2]);

        // 重い決済処理は Job に丸投げ
        ProcessPrimaryPaymentJob::dispatch($goId);
    }
}