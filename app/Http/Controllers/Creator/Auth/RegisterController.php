<?php

namespace App\Http\Controllers\Creator\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Creator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    /**
     * 登録画面の表示
     */
    public function showRegistrationForm()
    {
        return Inertia::render('Creator/Auth/Register');
    }

    /**
     * 登録処理
     */
    public function register(Request $request)
    {
        $request->validate([
            'shop_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:creators',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $creator = Creator::create([
            'shop_name' => $request->shop_name,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::guard('creator')->login($creator);

        return redirect()->route('creator.dashboard');
    }
}