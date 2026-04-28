<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * フロントエンド（Inertia）に渡す翻訳データを取得
     */
    protected function getTranslationData()
    {
        $locale = app()->getLocale();
        $path = lang_path("{$locale}.json");

        if (file_exists($path)) {
            return json_decode(file_get_contents($path), true);
        }

        return []; // ファイルがない場合は空配列
    }
}
