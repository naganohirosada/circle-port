<?php

namespace App\Http\Controllers\Creator\Auth;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use App\Services\Creator\CreatorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    protected $creatorService;

    public function __construct(CreatorService $creatorService)
    {
        $this->creatorService = $creatorService;
    }

    public function showRegistrationForm()
    {
        return Inertia::render('Creator/Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255|unique:creators',
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:creators',
            'password'  => 'required|string|min:8|confirmed',
            
            // SNS (任意)
            'x_id'         => 'nullable|string|max:100',
            'pixiv_id'     => 'nullable|string|max:100',
            'bluesky_id'   => 'nullable|string|max:100',
            'instagram_id' => 'nullable|string|max:100',
            'booth_url'    => 'nullable|url|max:255',
            'fanbox_url'   => 'nullable|url|max:255',

            // 振込先 (任意)
            'bank_name'      => 'nullable|string|max:255',
            'branch_name'    => 'nullable|string|max:255',
            'account_type'   => 'nullable|string|in:普通,当座',
            'account_number' => 'nullable|string|max:20',
            'account_holder' => 'nullable|string|max:255',
        ]);

        $creator = DB::transaction(function () use ($validated) {
            // 1. クリエイター作成
            $creator = Creator::create([
                'shop_name' => $validated['shop_name'],
                'name'      => $validated['name'],
                'email'     => $validated['email'],
                'password'  => Hash::make($validated['password']),
                
                'x_id'         => $validated['x_id'] ?? null,
                'pixiv_id'     => $validated['pixiv_id'] ?? null,
                'bluesky_id'   => $validated['bluesky_id'] ?? null,
                'instagram_id' => $validated['instagram_id'] ?? null,
                'booth_url'    => $validated['booth_url'] ?? null,
                'fanbox_url'   => $validated['fanbox_url'] ?? null,

                'bank_name'      => $validated['bank_name'] ?? null,
                'branch_name'    => $validated['branch_name'] ?? null,
                'account_type'   => $validated['account_type'] ?? '普通',
                'account_number' => $validated['account_number'] ?? null,
                'account_holder' => $validated['account_holder'] ?? null,
            ]);

            // 2. 初期名の翻訳データを全言語分作成
            $this->creatorService->updateProfile($creator, [
                'name'    => $validated['name'],
                'profile' => '', // 初期は空
            ]);

            return $creator;
        });

        Auth::guard('creator')->login($creator);

        return redirect()->route('creator.dashboard');
    }
}