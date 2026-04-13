<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Creator\Auth\LoginController;
use App\Http\Controllers\Creator\Auth\RegisterController;
use App\Http\Controllers\Creator\DashboardController;
use App\Http\Controllers\Creator\ProductController;
use App\Http\Controllers\Creator\ProductionController;
use App\Http\Controllers\Creator\SalesController;
use App\Http\Controllers\Creator\DomesticShippingController;

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
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        // 製作管理（Production Ledger）
        Route::get('/production', [ProductionController::class, 'index'])->name('production.index');
        // 売上管理（新規追加）
        Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');

        Route::get('/shipping', [DomesticShippingController::class, 'index'])->name('shipping.index');
        Route::get('/shipping/{id}', [DomesticShippingController::class, 'show'])->name('shipping.show');
        Route::post('/shipping/{id}/shipped', [DomesticShippingController::class, 'notifyShipped'])->name('shipping.shipped');
    });
});