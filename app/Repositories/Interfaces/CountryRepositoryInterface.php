<?php
namespace App\Repositories\Interfaces;

interface CountryRepositoryInterface
{
    /**
     * ステータスがアクティブな国を翻訳付きで取得
     */
    public function getActiveCountriesWithTranslations(string $locale);
}