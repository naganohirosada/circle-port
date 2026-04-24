<?php
namespace App\Repositories\Interfaces;

use App\Models\Payment;

interface PayoutRepositoryInterface
{
    public function adjustPayoutForRefund(Payment $payment): void;
}