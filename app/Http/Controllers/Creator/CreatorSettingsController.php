<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\UpdateProfileRequest;
use App\Http\Requests\Creator\UpdateBankRequest;
use App\Services\Creator\CreatorService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CreatorSettingsController extends Controller
{
    protected $creatorService;

    public function __construct(CreatorService $creatorService)
    {
        $this->creatorService = $creatorService;
    }

    public function editProfile()
    {
        $creator = Auth::guard('creator')->user();
        // 翻訳データをリレーションでロード
        $creator->load(['translations' => function($query) {
            $query->where('locale', app()->getLocale());
        }]);

        return Inertia::render('Creator/Settings/Profile', [
            'creator' => $creator,
        ]);
    }

    /**
     * プロフィールの更新処理
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $creator = Auth::guard('creator')->user();

        if (!$creator) {
            abort(403, 'Unauthorized');
        }

        // ログイン中のCreatorモデルを渡す
        $this->creatorService->updateProfile($creator, $request->validated());

        return back()->with('message', '更新が完了しました！');
    }

    public function editBank()
    {
        $creator = Auth::guard('creator')->user();

        return Inertia::render('Creator/Settings/Bank', [
            'creator' => $creator,
        ]);
    }

    public function updateBank(UpdateBankRequest $request)
    {
        $creator = Auth::guard('creator')->user();

        // シンプルな更新なので、今回はリポジトリ/サービス経由または直接update
        $creator->update($request->validated());

        return back()->with('message', '振込先情報を更新しました。');
    }
}