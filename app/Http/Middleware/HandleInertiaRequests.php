<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\App;

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
                'user' => $request->user(),
            ],
        ];
    }
}
