<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TipBenefit;
use App\Models\Creator;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BenefitController extends Controller
{
    /**
     * 特典・サンクスカード設定ダッシュボードの表示
     */
    public function index()
    {
        $creator = auth()->user();
        if (!$creator) {
            return redirect()->route('creator.dashboard')->with('error', 'クリエイタープロファイルが見つかりません。');
        }

        $benefits = TipBenefit::where('creator_id', $creator->id)
            ->orderBy('min_tip_amount', 'asc')
            ->get();

        return Inertia::render('Creator/Benefit/Index', [
            'benefits' => $benefits,
            'creator'  => $creator,
            'status'   => session('status'),
            'error'    => session('error'),
        ]);
    }

    /**
     * 応援チップデジタル特典の新規アップロード保存
     */
    public function storeBenefit(Request $request)
    {
        $request->validate([
            'benefit_title'  => 'required|string|max:255',
            'min_tip_amount' => 'required|integer|min:100',
            'benefit_file'   => 'required|file|max:51200', // 最大50MB
        ]);

        $creator = auth()->user()->creator;

        if ($request->hasFile('benefit_file')) {
            // 特典ファイルは不正ダウンロードを防ぐためセキュアディスクに非公開保存
            $path = $request->file('benefit_file')->store('secure_benefits');

            TipBenefit::create([
                'creator_id'     => $creator->id,
                'min_tip_amount' => $request->input('min_tip_amount'),
                'benefit_title'  => $request->input('benefit_title'),
                'file_path'      => $path,
                'file_mime'      => $request->file('benefit_file')->getMimeType(),
            ]);
        }

        return redirect()->route('creator.benefits.index')->with('status', '新しいチップ応援特典アセットを正常に登録しました。');
    }

    /**
     * デジタル特典の削除
     */
    public function destroyBenefit($id)
    {
        $creator = auth()->user()->creator;
        $benefit = TipBenefit::where('creator_id', $creator->id)->findOrFail($id);

        if ($benefit->file_path) {
            Storage::delete($benefit->file_path);
        }

        $benefit->delete();

        return redirect()->route('creator.benefits.index')->with('status', '応援特典アセットを削除しました。');
    }

    /**
     * オンデマンド・サンクスカードデザイン（物理同梱）の更新
     */
    public function updateCardSettings(Request $request)
    {
        $request->validate([
            'thanks_card_message' => 'nullable|string|max:1000',
            'card_bg'             => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'card_sign'           => 'nullable|image|mimes:png|max:2048', // サインは透過PNG限定
        ]);

        $creator = auth()->user()->creator;
        $creator->thanks_card_message = $request->input('thanks_card_message');

        // カード背景画像のアップロード処理
        if ($request->hasFile('card_bg')) {
            if ($creator->thanks_card_background) {
                Storage::disk('public')->delete($creator->thanks_card_background);
            }
            $creator->thanks_card_background = $request->file('card_bg')->store('thanks_cards', 'public');
        }

        // 透過サインPNG画像のアップロード処理
        if ($request->hasFile('card_sign')) {
            if ($creator->thanks_card_signature) {
                Storage::disk('public')->delete($creator->thanks_card_signature);
            }
            $creator->thanks_card_signature = $request->file('card_sign')->store('thanks_signs', 'public');
        }

        $creator->save();

        return redirect()->route('creator.benefits.index')->with('status', 'オンデマンド・サンクスカードの印刷デザイン構成を更新しました。');
    }
}