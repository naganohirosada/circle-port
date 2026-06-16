<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 毎時0分に成立プロジェクトの決済チェックを行う
Schedule::command('go:settle')->hourly();

/**
 * 【GDPR・データプライバシー法第5条完全準拠】
 * 配送完了から180日が経過した個人特定情報を毎日深夜02:00に完全自動で大掃除・マスキング巡回執行
 */
Schedule::command('privacy:cleanup')
    ->dailyAt('02:00')
    ->runInBackground() // サーバー負荷を分散するためにバックグラウンドで安全に実行
    ->onOneServer();

/**
 * 【Incoterms DDU条件 & 倉庫スペース泥沼化の自動完全防衛】
 * 2次決済を30日間放置した滞留荷物の自動没収・スペース解放巡回を、毎日深夜03:00に完全自動で執行
 */
Schedule::command('logistics:warehouse-guard')
    ->dailyAt('03:00')
    ->runInBackground() // サーバー負荷を分散するためにバックグラウンドで安全に実行
    ->onOneServer();    // マルチサーバー環境での二重起動による行デッドロックを100%防止