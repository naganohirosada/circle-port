<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fan\Mypage\StoreAddressRequest;
use App\Services\Fan\AddressService;
use App\Models\Country;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AddressController extends Controller
{
    protected $addressService;

    public function __construct(AddressService $addressService)
    {
        $this->addressService = $addressService;
    }

    /**
     * 住所一覧
     */
    public function index(): Response
    {
        $addresses = $this->addressService->getUserAddresses(auth()->id());

        return Inertia::render('Fan/Mypage/Address/Index', [
            'addresses' => $addresses
        ]);
    }

    /**
     * 新規登録画面
     */
    public function create(): Response
    {
        $locale = app()->getLocale();
        $countries = Country::with('translations')->get()->map(function ($country) use ($locale) {
            return [
                'id'   => $country->id,
                'name' => $country->getTranslatedName($locale), // ヘルパーを使用
            ];
        });
        return Inertia::render('Fan/Mypage/Address/Create', [
            'countries' => $countries
        ]);
    }

    /**
     * 保存処理
     */
    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $this->addressService->createAddress(auth()->id(), $request->validated());

        return redirect()->route('fan.mypage.addresses.index')
            ->with('success', __('Address saved successfully'));
    }

    /**
     * 削除処理（論理削除）
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->addressService->deleteAddress(auth()->id(), $id);

        return redirect()->back()
            ->with('success', __('Address deleted successfully'));
    }

    /**
     * 編集画面の表示
      * @param int $id
      * @return Response
      * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function edit(int $id): Response
    {
        $userId = auth()->id();
        $address = $this->addressService->getByIdAndUser($userId, $id);

        if (!$address) abort(404);

        $locale = app()->getLocale();
        $countries = \App\Models\Country::with('translations')->get()->map(function ($country) use ($locale) {
            return [
                'id'   => $country->id,
                'name' => $country->getTranslatedName($locale),
            ];
        });

        return Inertia::render('Fan/Mypage/Address/Edit', [
            'address'   => $address,
            'countries' => $countries
        ]);
    }

    /**
     * 更新処理
     * @param StoreAddressRequest $request
     * @param int $id
     * @return RedirectResponse
     */
    public function update(StoreAddressRequest $request, int $id): RedirectResponse
    {
        $this->addressService->updateAddress(auth()->id(), $id, $request->validated());

        return redirect()->route('fan.mypage.addresses.index')
            ->with('success', __('Address updated successfully'));
    }

}