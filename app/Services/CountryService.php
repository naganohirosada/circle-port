<?php
namespace App\Services;

use App\Repositories\Interfaces\CountryRepositoryInterface;
use Illuminate\Support\Facades\App;

class CountryService
{
    protected $countryRepository;

    public function __construct(CountryRepositoryInterface $countryRepository)
    {
        $this->countryRepository = $countryRepository;
    }

    /**
     * 登録フォーム用の国リストを取得（言語適用済み）
     */
    public function getCountriesForRegistration()
    {
        $locale = App::getLocale();
        $countries = $this->countryRepository->getActiveCountriesWithTranslations($locale);
        return $countries->map(function($country) use ($locale) {
            $translation = $country->translations->where('locale', $locale)->first() 
                ?? $country->translations->where('locale', 'en')->first();
            return [
                'id' => $country->id,
                'name' => $translation ? $translation->name : 'Unknown',
                'iso_code' => $country->iso_code
            ];
        })
        ->sortBy('name') // アルファベット順
        ->values();
    }
}