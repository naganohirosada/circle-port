<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Fan\Auth\RegisterController;
use App\Http\Controllers\Fan\Auth\LoginController;
use App\Http\Controllers\Fan\DashboardController;
use App\Http\Controllers\Fan\ProductController;
use App\Http\Controllers\Fan\CartController;
use App\Http\Controllers\Fan\MypageController;
use App\Http\Controllers\Fan\ProfileController;
use App\Http\Controllers\Fan\AddressController;
use App\Http\Controllers\Fan\PaymentController;
use App\Http\Controllers\Fan\CheckoutController;

Route::prefix('fan')->name('fan.')->group(function () {
    // 未ログイン時のみアクセス可能
    Route::middleware('guest:fan')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
        Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
        Route::post('register', [RegisterController::class, 'register'])->name('register.store');
    });

    // 商品一覧
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    // 作品詳細
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

    // ログイン必須
    Route::middleware('auth:fan')->group(function () {
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // カート関連
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
        Route::patch('/cart/update/{cartKey}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('/cart/remove/{cartKey}', [CartController::class, 'remove'])->name('cart.remove');

        // マイページ関連
        Route::get('/', [MypageController::class, 'dashboard'])->name('mypage.dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('mypage.profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('mypage.profile.update');

        // 配送先関連
        Route::get('/addresses', [AddressController::class, 'index'])->name('mypage.addresses.index');
        Route::get('/addresses/create', [AddressController::class, 'create'])->name('mypage.addresses.create');
        Route::post('/addresses', [AddressController::class, 'store'])->name('mypage.addresses.store');
        Route::get('/addresses/{id}/edit', [AddressController::class, 'edit'])->name('mypage.addresses.edit');
        Route::patch('/addresses/{id}', [AddressController::class, 'update'])->name('mypage.addresses.update');
        Route::delete('/addresses/{id}', [AddressController::class, 'destroy'])->name('mypage.addresses.destroy');
        // 決済方法登録関連
        Route::get('/payments', [PaymentController::class, 'index'])->name('mypage.payments.index');
        Route::get('/payments/create', [PaymentController::class, 'create'])->name('mypage.payments.create');
        Route::post('/payments', [PaymentController::class, 'store'])->name('mypage.payments.store');

        // デフォルト設定切り替え (Custom Action)
        Route::patch('/payments/{id}/make-default', [PaymentController::class, 'makeDefault'])->name('mypage.payments.make-default');

        // 削除（論理削除）
        Route::delete('/payments/{id}', [PaymentController::class, 'destroy'])->name('mypage.payments.destroy');

        // 注文実行
        Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
        // 注文完了画面 (Success)
        Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
    });
});
