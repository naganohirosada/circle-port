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
        $deepLTargetLang = $this->getDeepLTargetCode($targetLang);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'DeepL-Auth-Key ' . $apiKey,
            ])->asForm()
            ->post('https://api-free.deepl.com/v2/translate', [
                'text'        => [$text],
                'target_lang' => $deepLTargetLang,
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

    /**
     * システムの言語コードをDeepLのTarget Languageコードに変換する
     */
    private function getDeepLTargetCode(string $locale): string
    {
        $map = [
            'en' => 'EN-US',   // 英語（アメリカ）にマッピング
            'zh' => 'ZH-HANS', // 中国語（簡体字）にマッピング
            // ja, fr, th はそのまま大文字にすればDeepLで通る
        ];

        // マップにあればそれを返し、なければ大文字にして返す
        return $map[strtolower($locale)] ?? strtoupper($locale);
    }
}