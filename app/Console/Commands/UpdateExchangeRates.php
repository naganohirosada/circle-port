<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Stripe\StripeClient;
use App\Models\Currency;

class UpdateExchangeRates extends Command
{
    protected $signature = 'currency:update-rates';

    public function handle()
    {
        $stripe = new StripeClient(config('services.stripe.secret'));
        
        // JPYをベースとした各通貨のレートを取得
        $rates = $stripe->exchangeRates->retrieve('jpy');

        foreach (Currency::all() as $currency) {
            $code = strtolower($currency->code);
            if (isset($rates->rates[$code])) {
                $currency->update([
                    'exchange_rate' => $rates->rates[$code],
                    'last_updated_at' => now(),
                ]);
            }
        }

        $this->info('Exchange rates updated successfully.');
    }
}