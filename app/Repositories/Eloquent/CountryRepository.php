<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Interfaces\CountryRepositoryInterface;
use App\Models\Country;

class CountryRepository implements CountryRepositoryInterface
{
    public function getActiveCountriesWithTranslations(string $locale)
    {
        // 憲法第4条: Eager Loading(with)でN+1を防止し、selectでカラムを絞る
        return Country::where('status', 1)
            ->with(['translations' => function($query) use ($locale) {
                $query->whereIn('locale', [$locale, 'en']);
            }])
            ->select(['id', 'iso_code'])
            ->get();
    }
}