<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use App\Models\Country; // Countryモデルをインポート
use Stevebauman\Location\Facades\Location;

class HandleFanLocale
{
    public function handle(Request $request, Closure $next)
    {
        $isoCode = null;

        if (auth('fan')->check()) {
            $isoCode = auth('fan')->user()->country?->iso_code;
        } else {
            $position = Location::get($request->ip());
            if ($position) {
                $isoCode = $position->countryCode;
            }
        }

        // DBから言語コードを取得（なければ 'en' をデフォルトに）
        $locale = $this->determineLocale($isoCode);
        
        App::setLocale($locale);

        return $next($request);
    }

    /**
     * iso_codeを元にDBからlang_codeを検索する
     */
    private function determineLocale($isoCode)
    {
        if (!$isoCode) return 'en';

        // 24時間国リストをキャッシュに保持
        $countriesMap = cache()->remember('countries_locale_map', 86400, function () {
            return Country::pluck('lang_code', 'iso_code')->toArray();
        });

        return $countriesMap[$isoCode] ?? 'en';
    }
}