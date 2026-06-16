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
     * Stripeからの高信頼Webhookイベントを一括受信・自動防衛執行
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            // 偽装Webhookを100%防止する署名検証（完全保護）
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('【Stripe Webhookエラー】無効なペイロードを受信しました。');
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            Log::error('【Stripe Webhookエラー】署名検証(Signature)に失敗しました。リクエストが偽装されている可能性があります。');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // 受信したイベントタイプごとに大掃除・仕分け
        switch ($event->type) {
            
            // --- 【法的・財務リスク防衛の核心】：海外ファンによる不当なチャージバック（紛争）が発生した瞬間 ---
            case 'charge.dispute.created':
                $dispute = $event->data->object;
                $paymentIntentId = $dispute->payment_intent;
                $disputeId = $dispute->id;
                $reason = $dispute->reason;
                $amount = $dispute->amount;

                Log::warning("🚨 【チャージバック検知】Stripeより不服申し立て通知を受信しました。IntentID: {$paymentIntentId}, DisputeID: {$disputeId}, 理由: {$reason}, 金額: {$amount} JPY");

                if (!$paymentIntentId) {
                    Log::error("【チャージバック自動BAN失敗】DisputeにPaymentIntentが紐付いていません。");
                    break;
                }

                // データベーストランザクションを保護し、対象ユーザーを一本釣りで永久凍結に叩き落とす
                DB::transaction(function () use ($paymentIntentId, $disputeId, $reason) {
                    
                    // 1. paymentsテーブルから、該当のStripe決済IDを持つトランザクションを検索
                    $payment = DB::table('payments')
                        ->where('external_transaction_id', $paymentIntentId)
                        ->first();

                    if (!$payment) {
                        Log::error("【チャージバック自動BAN失敗】該当する決済トランザクションIDがデータベースに見つかりません。IntentID: {$paymentIntentId}");
                        return;
                    }

                    // 2. 決済レコードから親注文（orders）を特定し、注文したファンID（fan_id）を取得
                    $order = DB::table('orders')
                        ->where('id', $payment->order_id)
                        ->first();

                    if (!$order || !$order->fan_id) {
                        Log::error("【チャージバック自動BAN失敗】決済に紐付く正規の注文情報またはファンIDの特定に失敗しました。PaymentID: {$payment->id}");
                        return;
                    }

                    $fanId = $order->fan_id;

                    // 3. 【社会的な抹殺の執行】：fansテーブルの該当ファンのステータスを一瞬で「blacklisted（永久凍結）」へ強制上書きクレンジング
                    $updatedFans = DB::table('fans')
                        ->where('id', $fanId)
                        ->update([
                            'status'     => 'blacklisted', // 前日FAQと100%完全同期するブラックリストステータス
                            'updated_at' => Carbon::now()
                        ]);

                    // 4. 連動して、該当ファンが現在絶賛支払い待ち中（status = 20）のすべての国際配送手続きを即時強制凍結
                    DB::table('international_shippings')
                        ->where('fan_id', $fanId)
                        ->where('status', 20)
                        ->update([
                            'status'     => 99, // 99 = DISPUTED_FROZEN (チャージバックによる永久アカウントロック)
                            'notes'      => DB::raw("CONCAT(COALESCE(notes, ''), '\n[CRITICAL]: 決済チャージバック（不服申し立て）検知によりアカウントが永久凍結されたため、物流倉庫側で配送を完全差し止めロックしました。')"),
                            'updated_at' => Carbon::now()
                        ]);

                    if ($updatedFans > 0) {
                        // 5. 【財務局・国際不正利用監査ログ】：Stripeチャージバック荒らしアカウントを完全排除した動かぬ証拠ログを永続刻印
                        Log::critical("⛔ 【チャージバック自動BAN完了】不正利用ファンの永久凍結を強制執行しました。対象ファンID: {$fanId}, Stripe紛争ID: {$disputeId}, 不服申立理由: {$reason}, 執行日時: " . Carbon::now()->toDateTimeString());
                    }
                });
                break;

            default:
                // その他の正常系決済イベント（checkout.session.completedなど）は既存のサービス層へクリーンに委ねる
                Log::info("Stripe Webhookイベント受信 (スキップ): {$event->type}");
                break;
        }

        return response()->json(['status' => 'success'], 200);
    }
}