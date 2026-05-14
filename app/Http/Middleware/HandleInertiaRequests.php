<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\App;
use App\Models\Currency;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $fan = $request->user('fan');
        $currency = ($fan ? $fan->currency : null) ?? Currency::where('code', 'JPY')->first();

        if (!$currency) {
            $currency = (object)[
                'code' => 'JPY',
                'symbol' => '¥',
                'exchange_rate' => 1.0,
            ];
        }
        return [
            ...parent::share($request),
            'locale' => App::getLocale(),
            'language' => function () {
                $locale = App::getLocale();
                $path = resource_path("lang/{$locale}.json");

                if (!file_exists($path)) {
                    $path = resource_path('lang/en.json');
                }

                return file_exists($path) ? json_decode(file_get_contents($path), true) : [];
            },
            'auth' => [
                'user' => $request->user('admin') ?: $request->user('creator') ?: $request->user('fan') ?: $request->user(),
                'admin' => $request->user('admin'),
                'creator' => $request->user('creator'),
                'fan' => $request->user('fan'),
            ],
            'cartCount' => function () {
                $cart = session()->get('fan_cart', []);
                return array_sum(array_column($cart, 'quantity'));
            },
            'checkout_settings' => [
                'tax_rate'     => config('circleport.checkout.tax_rate'), 
                'fee_rate'     => config('circleport.checkout.gateway_fee_rate'),
                'go_fee_rate'  => config('circleport.checkout.go_gateway_fee_rate'),
                'shipping_fee' => config('circleport.checkout.domestic_shipping_fee'),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'), // ここが重要
            ],
            'currency' => [
                'code' => $currency->code,
                'symbol' => $currency->symbol,
                'rate' => (float)$currency->exchange_rate,
            ],
        ];
    }
}
