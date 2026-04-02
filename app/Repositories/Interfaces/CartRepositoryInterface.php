<?php

namespace App\Repositories\Interfaces;

interface CartRepositoryInterface
{
    public function getCart(): array;
    public function updateCart(array $cart): void;
    public function clearCart($fanId): void;
    public function removeItems(array $keys): void;
}