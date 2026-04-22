<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\Common\StripeWebhookService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    /**
     * @param StripeWebhookService $webhookService
     */
    public function __construct(
        protected StripeWebhookService $webhookService
    ) {}

    /**
     * StripeからのWebhookリクエストを受信・処理
     * * @param Request $request
     * @return JsonResponse
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            // 1. 署名の検証とイベントオブジェクトの構築
            $event = Webhook::constructEvent(
                $payload, 
                $sigHeader, 
                $endpointSecret
            );

            // 2. Service層へイベントの処理を委譲
            $this->webhookService->handleEvent($event);

            return response()->json(['message' => 'Webhook Handled'], 200);

        } catch (UnexpectedValueException $e) {
            // ペイロードが無効な場合
            Log::error('Stripe Webhook: Invalid Payload', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid payload'], 400);

        } catch (SignatureVerificationException $e) {
            // 署名検証に失敗した場合（秘密鍵の不一致など）
            Log::error('Stripe Webhook: Signature Verification Failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);

        } catch (\Exception $e) {
            // その他の予期せぬエラー
            Log::error('Stripe Webhook: General Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }
}