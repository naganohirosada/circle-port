<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Creator\Auth\LoginController;
use App\Http\Controllers\Creator\Auth\RegisterController;
use App\Http\Controllers\Creator\DashboardController;
use App\Http\Controllers\Creator\ProductController;
use App\Http\Controllers\Creator\ProductionController;
use App\Http\Controllers\Creator\SalesController;
use App\Http\Controllers\Creator\DomesticShippingController;
use App\Http\Controllers\Creator\ProjectAnnouncementController;
use App\Http\Controllers\Creator\ProjectController;
use App\Http\Controllers\Creator\AIController;
use App\Http\Controllers\Creator\CreatorSettingsController;

// 🎨 Creator (国内サークル向け)
Route::prefix('creator')->name('creator.')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register'])->name('register.store');

    Route::middleware('auth:creator')->group(function () {
        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        // 製作管理（Production Ledger）
        Route::get('/production', [ProductionController::class, 'index'])->name('production.index');
        // 売上管理（新規追加）
        Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');

        Route::get('/shipping', [DomesticShippingController::class, 'index'])->name('shipping.index');
        // 通常注文用の配送登録
        Route::get('/shipping/create/regular', [DomesticShippingController::class, 'createRegular'])->name('shipping.regular');
        // GO注文用の配送登録
        Route::get('/shipping/create/go', [DomesticShippingController::class, 'createGo'])->name('shipping.go');
        Route::post('/shipping/store', [DomesticShippingController::class, 'store'])->name('store');
        Route::get('/shipping/{domesticShipping}', [DomesticShippingController::class, 'show'])->name('show');
        Route::get('/shipping/{id}', [DomesticShippingController::class, 'show'])->name('shipping.show');
        Route::post('/shipping/{id}/shipped', [DomesticShippingController::class, 'notifyShipped'])->name('shipping.shipped');
        Route::patch('/shipping/{id}/notify', [DomesticShippingController::class, 'notify'])->name('shipping.notify');
        Route::post('shipping/bulk-ship', [DomesticShippingController::class, 'ship'])->name('shipping.ship');

        // プロジェクト管理 (CRUD)
        Route::resource('project', ProjectController::class);

        // プロジェクト期間延長 (Custom Action)
        Route::post('project/{project}/extend', [ProjectController::class, 'extend'])
            ->name('project.extend');

        // 進捗アナウンス (Nested Resource)
        Route::prefix('project/{project}')->name('project.announcement.')->group(function () {
            Route::get('announcements', [ProjectAnnouncementController::class, 'index'])->name('index');
            Route::post('announcements', [ProjectAnnouncementController::class, 'store'])->name('store');
            // 必要に応じて show, edit, delete を追加
        });

        // AI翻訳用のルートを追加
        Route::post('/ai/translate', [AIController::class, 'translate'])->name('ai.translate');

        Route::prefix('settings')->name('settings.')->group(function () {
            // プロフィール編集
            Route::get('/profile', [CreatorSettingsController::class, 'editProfile'])->name('profile');
            Route::post('/profile', [CreatorSettingsController::class, 'updateProfile'])->name('profile.update');
            
            // 振込先設定
            Route::get('/bank', [CreatorSettingsController::class, 'editBank'])->name('bank');
            Route::post('/bank', [CreatorSettingsController::class, 'updateBank'])->name('bank.update');
        });
    });
});