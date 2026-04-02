<?php

namespace App\Repositories\Eloquent\Cart;
use App\Repositories\Interfaces\CartRepositoryInterface;

class SessionCartRepository implements CartRepositoryInterface
{
    private const SESSION_KEY = 'fan_cart';

    public function getCart(): array {
        return session()->get(self::SESSION_KEY, []);
    }

    public function updateCart(array $cart): void {
        session()->put(self::SESSION_KEY, $cart);
    }

    public function clearCart($fanId): void {
        session()->forget(self::SESSION_KEY);
    }

    public function removeItems(array $keys): void
    {
        // 1. セッションから現在のアイテムを直接取得
        $items = session()->get(self::SESSION_KEY, []);
        if (empty($items)) {
            return;
        }

        // 2. フィルタリング（削除対象「ではない」ものだけを残す）
        $remainingItems = array_filter($items, function ($item) use ($keys) {
            // 憲法第1条：型を緩く比較（string/int混在対策）するために !in_array を使用
            // もし厳格にするなら第3引数に true を入れるが、セッションは型が崩れやすいため緩めが安全
            return !in_array($item['product_id'], $keys);
        });

        // 3. 配列の添字を振り直す（JSON化した時に連想配列（オブジェクト）になるのを防ぐ）
        $newItems = array_values($remainingItems);

        // 4. セッションへの書き戻し
        if (empty($newItems)) {
            // 全て削除された場合はカート自体を忘れる
            session()->forget('cart');
        } else {
            // items だけを上書き
            session()->put(self::SESSION_KEY, $newItems);
            
            // ★重要：合計金額（total_price等）も残ったアイテムで再計算して更新
            $this->refreshCartTotals($newItems);
        }

        // 憲法第1条：確実に即時保存
        session()->save();
    }

    /**
     * 残ったアイテムからカートのサマリーを再計算する
     */
    private function refreshCartTotals(array $items): void
    {
        session()->put(self::SESSION_KEY.'quantity', count($items));
    }
}