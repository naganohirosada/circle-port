<?php

namespace App\Http\Controllers\Creator\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * ログイン画面の表示
     */
    public function create()
    {
        return Inertia::render('Creator/Auth/Login');
    }

    /**
     * ログイン処理
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 'creator' ガードを使って認証を試みる
        if (Auth::guard('creator')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('creator.dashboard'));
        }

        return back()->withErrors([
            'email' => '認証情報が記録と一致しません。',
        ])->onlyInput('email');
    }

    /**
     * ログアウト処理
     */
    public function destroy(Request $request)
    {
        Auth::guard('creator')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('creator.login');
    }
}