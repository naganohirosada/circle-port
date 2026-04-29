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
use App\Http\Controllers\Fan\OrderController;
use App\Http\Controllers\Fan\GroupOrderController;
use App\Http\Controllers\Fan\InternationalShippingController;
use App\Http\Controllers\Fan\CreatorController;
use App\Http\Controllers\Webhook\StripeWebhookController;

// Stripe Webhook (CSRF除外設定済み)
Route::post('/webhook/stripe', [StripeWebhookController::class, 'handle']);

Route::prefix('fan')->name('fan.')->group(function () {
    
    // --- 未ログイン時のみアクセス可能 ---
    Route::middleware('guest:fan')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
        Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register');
        Route::post('register', [RegisterController::class, 'register'])->name('register.store');
    });

    // 商品一覧・詳細は未ログインでも閲覧可能
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

    // --- ログイン必須 (fanガードを指定) ---
    Route::middleware('auth:fan')->group(function () {
        Route::post('/orders/{order}/retry', [OrderController::class, 'retryPayment'])->name('orders.retry');

        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // カート関連
        Route::prefix('cart')->name('cart.')->group(function () {
            Route::get('/', [CartController::class, 'index'])->name('index');
            Route::post('/add', [CartController::class, 'add'])->name('add');
            Route::patch('/update/{cartKey}', [CartController::class, 'update'])->name('update');
            Route::delete('/remove/{cartKey}', [CartController::class, 'remove'])->name('remove');
        });

        // マイページ関連
        Route::get('/mypage', [MypageController::class, 'dashboard'])->name('mypage.dashboard');
        Route::prefix('profile')->name('mypage.profile.')->group(function () {
            Route::get('/', [ProfileController::class, 'edit'])->name('edit');
            Route::patch('/', [ProfileController::class, 'update'])->name('update');
        });

        // 配送先関連
        Route::prefix('addresses')->name('mypage.addresses.')->group(function () {
            Route::get('/', [AddressController::class, 'index'])->name('index');
            Route::get('/create', [AddressController::class, 'create'])->name('create');
            Route::post('/', [AddressController::class, 'store'])->name('store');
            Route::get('/{id}/edit', [AddressController::class, 'edit'])->name('edit');
            Route::patch('/{id}', [AddressController::class, 'update'])->name('update');
            Route::delete('/{id}', [AddressController::class, 'destroy'])->name('destroy');
        });

        // 決済方法関連
        Route::prefix('payments')->name('mypage.payments.')->group(function () {
            Route::get('/', [PaymentController::class, 'index'])->name('index');
            Route::get('/create', [PaymentController::class, 'create'])->name('create');
            Route::post('/', [PaymentController::class, 'store'])->name('store');
            Route::patch('/{id}/make-default', [PaymentController::class, 'makeDefault'])->name('make-default');
            Route::delete('/{id}', [PaymentController::class, 'destroy'])->name('destroy');
        });

        // 注文・チェックアウト
        Route::prefix('checkout')->name('checkout.')->group(function () {
            Route::post('/', [CheckoutController::class, 'store'])->name('store');
            Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('success');
        });

        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [OrderController::class, 'index'])->name('index');
            Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        });

        // Group Order (GO) 関連
        Route::prefix('go')->name('go.')->group(function () {
            Route::get('/index', [GroupOrderController::class, 'index'])->name('index');
            Route::get('/published', [GroupOrderController::class, 'index'])->name('published');
            Route::get('/create/{product_id?}', [GroupOrderController::class, 'create'])->name('create');
            Route::post('/', [GroupOrderController::class, 'store'])->name('store');
            Route::get('/managed', [MypageController::class, 'groupOrders'])->name('managed');
            Route::get('/detail/{id}', [GroupOrderController::class, 'show'])->name('detail');
            Route::post('/{id}/join', [GroupOrderController::class, 'join'])->name('join');
            Route::get('/{id}/thanks/{order_id}', [GroupOrderController::class, 'thanks'])->name('thanks');
            // MypageController側でGO詳細を表示する場合
            Route::get('/show/{id}', [MypageController::class, 'show'])->name('show');
        });

        // 国際配送関連 (プレフィックスの重複を修正)
        Route::prefix('international-shippings')->name('international-shippings.')->group(function () {
            Route::get('/', [InternationalShippingController::class, 'index'])->name('index');
            Route::get('/{id}', [InternationalShippingController::class, 'show'])->name('show');
            Route::post('/{id}/checkout', [InternationalShippingController::class, 'createShippingCheckoutSession'])->name('checkout');
            Route::get('/{id}/success', [InternationalShippingController::class, 'paymentSuccess'])->name('payment-success');
        });

        // API 関連
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/creators/{creator}/products', [GroupOrderController::class, 'getProducts'])->name('creators.products');
            Route::get('/fans/search', [GroupOrderController::class, 'searchFan'])->name('fans.search');
        });

        Route::get('/creator/{creator}', [CreatorController::class, 'show'])->name('creator.show');
        Route::post('/creators/{creator}/follow', [CreatorController::class, 'toggleFollow'])->name('creator.follow');
    });
});