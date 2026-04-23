<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout; // 振込管理モデル
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayoutController extends Controller
{
    public function index()
    {
        $payouts = Payout::with('creator')
            ->orderBy('scheduled_date', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Payouts/Index', [
            'payouts' => $payouts,
        ]);
    }

    public function show($id)
    {
        // 振込詳細と、それに含まれる決済内訳などをロード
        $payout = Payout::with([
            'creator',
            'details.payment' // どの決済分が含まれているかの詳細
        ])->findOrFail($id);

        return Inertia::render('Admin/Payouts/Show', [
            'payout' => $payout,
        ]);
    }

    // 振込完了ステータスへの更新（簡易版）
    public function markAsPaid($id)
    {
        $payout = Payout::findOrFail($id);
        $payout->update([
            'status' => 30, // 完了
            'paid_at' => now(),
        ]);

        return back()->with('success', '振込完了としてマークしました。');
    }

    public function execute(Payout $payout)
    {
        // 二重払い防止
        if ($payout->status === Payout::STATUS_PAID) {
            return back()->with('error', 'この振込は既に完了しています。');
        }

        DB::transaction(function () use ($payout) {
            // ステータス更新
            $payout->update([
                'status' => Payout::STATUS_PAID,
                'paid_at' => now(),
            ]);

            // 必要に応じて、ここでクリエイターに「振込完了メール」を飛ばす
            // Mail::to($payout->creator->user->email)->send(new PayoutCompletedMail($payout));
        });

        return back()->with('success', '振込処理を完了として記録しました。');
    }
}