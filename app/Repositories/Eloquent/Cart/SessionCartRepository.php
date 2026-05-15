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
        // 1. セッションから現在のアイテムを取得
        $items = session()->get(self::SESSION_KEY, []);
        if (empty($items)) {
            return;
        }

        $remainingItems = array_filter($items, function ($item, $index) use ($keys) {
            return !in_array($index, $keys);
        }, ARRAY_FILTER_USE_BOTH);

        // 3. 配列の添字を振り直す
        $newItems = array_values($remainingItems);

        // 4. セッションへの書き戻し
        if (empty($newItems)) {
            session()->forget(self::SESSION_KEY);
            session()->forget(self::SESSION_KEY . '_quantity');
        } else {
            session()->put(self::SESSION_KEY, $newItems);
            $this->refreshCartTotals($newItems);
        }

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