<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use App\Models\Language;
use Stevebauman\Location\Facades\Location;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        // config からサポート言語リストを取得
        $supportedLocales = config('locales.supported', ['en']);
        $fallback = config('locales.fallback', 'en');
        
        $locale = null;

        // 1. ログインユーザーの優先 (fanガード)
        $fan = auth()->guard('fan')->user();
        if ($fan && isset($fan->language->code)) {
            $locale = $fan->language->code;
        }

        // 2. セッション
        if (!$locale) {
            $locale = session()->get('guest_locale');
        }

        // 3. ブラウザ判定（config のリストを使用）
        if (!$locale) {
            $locale = $this->determineGuestLocale($request);
            session()->put('guest_locale', $locale);
        }

        // --- 憲法第2条：最終防衛ライン ---
        // 許可リストにない、または null の場合は強制的に設定値（en）
        if (!in_array($locale, $supportedLocales)) {
            $locale = $fallback;
        }

        App::setLocale((string)$locale);

        return $next($request);
    }

    /**
     * IPアドレスから言語を判定する
     */
    protected function determineGuestLocale(Request $request): string
    {
        // config からサポート言語リストを渡す
        $supported = config('locales.supported', ['en']);
        $fallback = config('locales.fallback', 'en');

        return $request->getPreferredLanguage($supported) ?: $fallback;
    }
}