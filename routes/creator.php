<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Creator\Auth\LoginController;
use App\Http\Controllers\Creator\Auth\RegisterController;
use App\Http\Controllers\Creator\DashboardController;
use App\Http\Controllers\Creator\ProductController;

// 🎨 Creator (国内サークル向け)
Route::prefix('creator')->name('creator.')->group(function () {
    Route::middleware('guest:creator')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
        Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
        Route::post('register', [RegisterController::class, 'register'])->name('register.store');
    });

    Route::middleware('auth:creator')->group(function () {
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
    });
});