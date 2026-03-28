<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Fan\Auth\RegisterController;
use App\Http\Controllers\Fan\Auth\LoginController;
use App\Http\Controllers\Fan\DashboardController;

Route::prefix('fan')->name('fan.')->group(function () {

    // 未ログイン時のみアクセス可能
    Route::middleware('guest:fan')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
        Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
        Route::post('register', [RegisterController::class, 'register'])->name('register.store');
    });

    // ログイン必須
    Route::middleware('auth:fan')->group(function () {
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });
});
