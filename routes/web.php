<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

// --- トップページ (Welcome) ---
// ファン向けトップページ（デフォルト）
Route::get('/', function () {
    return Inertia::render('Fan/Welcome');
})->name('welcome');

// クリエイター向けトップページ
Route::get('/for-creators', function () {
    return Inertia::render('Creator/Welcome');
})->name('welcome.creator');

Route::get('/creator/guide', function () {
    return Inertia::render('Creator/Guide');
})->name('creator.guide');

Route::get('/guide', function () {
    return Inertia::render('Fan/Guide');
})->name('fan.guide');

// ファン向けのルートを定義
require __DIR__.'/fan.php';
require __DIR__.'/creator.php';
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
