<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * DeepL APIを使用してテキストを翻訳
     * @param string|null $text 翻訳するテキスト
     * @param string $targetLang 目標言語コード（例: 'EN-US'）
     * @return string|null 翻訳されたテキスト、または翻訳失敗時の元テキスト
     */
    public function translate(?string $text, string $targetLang = 'EN-US'): ?string
    {
        if (empty($text)) return null;

        $apiKey = config('services.deepl.auth_key'); 

        try {
            $response = Http::withHeaders([
                'Authorization' => 'DeepL-Auth-Key ' . $apiKey,
            ])->asForm()
            ->post('https://api-free.deepl.com/v2/translate', [
                'text'        => [$text],
                'target_lang' => strtoupper($targetLang),
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