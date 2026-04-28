<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AI\TranslationService; // 既存のサービスを利用

class AIController extends Controller
{
    public function __construct(protected TranslationService $translator) {}

    public function translate(Request $request)
    {
        $targetLocales = ['en', 'zh', 'th', 'fr'];
        $result = [
            'name' => [],
            'description' => [],
            'material' => [],
            'variants' => []
        ];

        foreach ($targetLocales as $locale) {
            // 作品名
            $result['name'][$locale] = $this->translator->translate($request->name, $locale);
            // 説明文
            $result['description'][$locale] = $this->translator->translate($request->description, $locale);
            // 素材
            if ($request->material) {
                $result['material'][$locale] = $this->translator->translate($request->material, $locale);
            }
            
            // バリエーション名
            if (!empty($request->variants)) {
                foreach ($request->variants as $index => $vName) {
                    $result['variants'][$index][$locale] = $this->translator->translate($vName, $locale);
                }
            }
        }

        return response()->json($result);
    }
}