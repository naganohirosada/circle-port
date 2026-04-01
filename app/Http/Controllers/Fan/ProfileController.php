<?php
namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Language;
use App\Http\Requests\Fan\Mypage\UpdateProfileRequest;
use App\Services\Fan\ProfileService;
use Illuminate\Http\RedirectResponse;
use App\Models\Timezone;
use App\Models\Currency;

class ProfileController extends Controller
{
    protected $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function edit(): Response
    {
        $fan = auth()->guard('fan')->user();
        return Inertia::render('Fan/Mypage/Profile/Edit', [
            'profile' => [
                'name'          => $fan->name,
                'email'         => $fan->email,
                'country_id'    => $fan->country_id,
                'language_id' => $fan->language_id,
                'currency_id' => $fan->currency_id,
                'timezone_id'   => $fan->timezone_id,
            ],
            'countries' => Country::with('translations')->get()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->getTranslatedName(app()->getLocale())
            ]),
            // 憲法：サポートする言語リスト
            'languages' => Language::where('status', 1)->orderBy('sort_order', 'asc')->get(['id', 'name']),
            'timezones' => Timezone::where('status', 1)->orderBy('sort_order')->get(['id', 'display_name']),
            'currencies' => Currency::where('status', 1)->orderBy('sort_order')->get(['id', 'code', 'name']), // 追加
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        // 憲法：fan_id を使用してサービスを呼び出す
        $this->profileService->updateProfile(
            auth()->id(), 
            $request->validated()
        );

        return redirect()->back()->with('success', __('Profile updated successfully'));
    }
}