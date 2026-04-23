<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Admin\CarrierController;
use App\Http\Controllers\Admin\InspectionController;
use App\Http\Controllers\Admin\InternationalShippingController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\DomesticShippingController;
use App\Http\Controllers\Admin\CreatorController;
use App\Http\Controllers\Admin\OrderController;

Route::middleware('guest:admin')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store'])->name('login.store');
});

Route::middleware('auth:admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

    // 倉庫管理 (CRUD)
    Route::resource('warehouses', WarehouseController::class);

    Route::resource('carriers', CarrierController::class);

    // 検品管理
    Route::prefix('inspections')->name('inspections.')->group(function () {
        Route::get('/scan', [InspectionController::class, 'scan'])->name('scan'); // 追加
        Route::get('/', [InspectionController::class, 'index'])->name('index');
        Route::get('/{domesticShipping}', [InspectionController::class, 'show'])->name('show');
        Route::post('/{domesticShipping}/receive', [InspectionController::class, 'receive'])->name('receive');
        Route::post('/{domesticShipping}/complete', [InspectionController::class, 'complete'])->name('complete');
    });

    Route::prefix('international-shippings')->name('international-shippings.')->group(function () {
        Route::get('/', [InternationalShippingController::class, 'index'])->name('index');
        Route::get('/{id}', [InternationalShippingController::class, 'show'])->name('show');
        Route::post('/{id}/packing', [InternationalShippingController::class, 'updatePacking'])->name('update-packing');
    });

    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

    // 注文管理
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    // 国内配送管理 (Creator -> Warehouse)
    Route::get('/shippings/domestic', [DomesticShippingController::class, 'index'])->name('shippings.domestic.index');
    Route::get('/shippings/domestic/{order}', [DomesticShippingController::class, 'show'])->name('shippings.domestic.show');

    // クリエイター管理
    Route::get('/creators', [CreatorController::class, 'index'])->name('creators.index');
    Route::get('/creators/{creator}', [CreatorController::class, 'show'])->name('creators.show');

    // 振込管理
    Route::get('/payouts', [App\Http\Controllers\Admin\PayoutController::class, 'index'])->name('payouts.index');
    Route::get('/payouts/{payout}', [App\Http\Controllers\Admin\PayoutController::class, 'show'])->name('payouts.show');
    Route::post('/payouts/{payout}/paid', [App\Http\Controllers\Admin\PayoutController::class, 'markAsPaid'])->name('payouts.paid');

    // ファン管理
    Route::get('/fans', [App\Http\Controllers\Admin\FanController::class, 'index'])->name('fans.index');
    Route::get('/fans/{fan}', [App\Http\Controllers\Admin\FanController::class, 'show'])->name('fans.show');

    // 商品承認・管理
    Route::get('/products', [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [App\Http\Controllers\Admin\ProductController::class, 'show'])->name('products.show');
    Route::patch('/products/{product}/status', [App\Http\Controllers\Admin\ProductController::class, 'updateStatus'])->name('products.update-status');
});