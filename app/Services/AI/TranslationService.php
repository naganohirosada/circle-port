<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * DeepL APIを使用してテキストを翻訳
     */
    public function translate(?string $text, string $targetLang = 'EN-US'): ?string
    {
        if (empty($text)) return null;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'DeepL-Auth-Key ' . config('services.deepl.key'),
            ])->post('https://api-free.deepl.com/v2/translate', [
                'text'        => [$text],
                'target_lang' => $targetLang,
            ]);

            if ($response->successful()) {
                return $response->json('translations.0.text');
            }

            Log::error('DeepL API Error: ' . $response->body());
            return $text . ' [Translation Failed]';
            
        } catch (\Exception $e) {
            Log::error('Translation Exception: ' . $e->getMessage());
            return $text;
        }
    }
}