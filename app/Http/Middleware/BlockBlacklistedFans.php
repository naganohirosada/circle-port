<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation.Response;

class BlockBlacklistedFans
{
    /**
     * ブラックリスト入りした不正ユーザーのアクセスをカーネル水際で永久に遮断
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ファン用の認証ガード（'fan'）が有効、かつログインしているかチェック
        if (Auth::guard('fan')->check()) {
            $fan = Auth::guard('fan')->user();

            // 対象ファンのステータスがWebhook等で 'blacklisted'（永久凍結）に処されている場合
            if (($fan->status ?? null) === 'blacklisted') {
                
                // 1. セッションおよび認証トークンをその場で強制完全破壊（即時強制ログアウト）
                Auth::guard('fan')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // 2. 不正チャージバックに対する事前警告FAQの通り、一切のアクセスを403認可エラーで永久拒絶
                abort(403, 'Your account has been permanently blacklisted due to a violation of our global payment and dispute policy. Access denied.');
            }
        }

        return $next($request);
    }
}