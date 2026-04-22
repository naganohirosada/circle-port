<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Admin\CarrierController;
use App\Http\Controllers\Admin\InspectionController;
use App\Http\Controllers\Admin\InternationalShippingController;

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

});