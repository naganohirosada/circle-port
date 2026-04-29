<?php

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateProfileRequest extends FormRequest
{
    /**
     * 認可の判定
     */
    public function authorize(): bool
    {
        // creatorガードで認証されているか確認
        return Auth::guard('creator')->check();
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        // ログイン中のクリエイターIDを取得
        $creatorId = Auth::guard('creator')->id();

        return [
            'name'          => 'required|string|max:255',
            // 自分自身のIDをignoreすることで、編集時に「既に存在します」エラーを防ぐ
            'email'         => [
                'nullable', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('creators', 'email')->ignore($creatorId)
            ],
            'shop_name'     => [
                'nullable', 
                'string', 
                'max:255', 
                Rule::unique('creators', 'shop_name')->ignore($creatorId)
            ],
            'profile'       => 'nullable|string|max:1000',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480',
            'cover_image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480',
            
            // SNS系 IDのみ
            'x_id'          => 'nullable|string|max:100',
            'pixiv_id'      => 'nullable|string|max:100',
            'bluesky_id'    => 'nullable|string|max:100',
            'instagram_id'  => 'nullable|string|max:100',
            'booth_url'     => 'nullable|string|max:255', 
            'fanbox_url'    => 'nullable|string|max:255',
        ];
    }
}