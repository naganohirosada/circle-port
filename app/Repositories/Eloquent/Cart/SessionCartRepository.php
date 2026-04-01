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

    public function clearCart(): void {
        session()->forget(self::SESSION_KEY);
    }
}