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
        $locale = config('app.locale');

        // 憲法：'fan' ガードから返ってくるのは Fan モデルそのもの
        $fan = auth()->guard('fan')->user();
        if ($fan && $fan->language) {
            $locale = $fan->language->code;
        } else {
            // 未ログイン（ゲスト）の場合の処理
            if (!$fan) {
                $locale = Session::get('guest_locale');
            } else {
                $locale = $this->determineGuestLocale($request);
                Session::put('guest_locale', $locale);
            }
        }

        \Illuminate\Support\Facades\App::setLocale($locale);

        return $next($request);
    }

    /**
     * IPアドレスから言語を判定する
     */
    private function determineGuestLocale(Request $request): string
    {
        // IPから位置情報を取得
        $position = Location::get($request->ip());
        $countryCode = $position ? $position->countryCode : null;

        // 国コードから言語コードへのマッピング（CirclePortのターゲット5か国）
        $countryToLang = [
            'JP' => 'ja', // 日本
            'TW' => 'zh', // 台湾
            'HK' => 'zh', // 香港
            'FR' => 'fr', // フランス
            'TH' => 'th', // タイ
        ];

        $suggestedLang = $countryToLang[$countryCode] ?? 'en';

        // 憲法：提示された言語がマスタ(languagesテーブル)に存在するかチェック
        $exists = Language::where('code', $suggestedLang)
            ->where('status', 1)
            ->exists();

        return $exists ? $suggestedLang : 'en';
    }
}