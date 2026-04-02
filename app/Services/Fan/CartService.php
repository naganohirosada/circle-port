<?php

namespace App\Services\Fan;

use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Models\Product;
use App\Models\ProductVariant;

class CartService
{
    protected $cartRepo;

    public function __construct(CartRepositoryInterface $cartRepo)
    {
        $this->cartRepo = $cartRepo;
    }

    /**
     * カートに商品を追加
     * @param int $productId
     * @param int|null $variationId
     * @param int $quantity
     * @return void
     */
    public function addItem(int $productId, ?int $variationId, int $quantity)
    {
        $cart = $this->cartRepo->getCart();
        $key = $this->generateKey($productId, $variationId);

        // 在庫チェック等のロジック（将来的に拡張）
        
        if (isset($cart[$key])) {
            $cart[$key]['quantity'] += $quantity;
        } else {
            $cart[$key] = [
                'product_id' => $productId,
                'variation_id' => $variationId,
                'quantity' => $quantity,
                'added_at' => now()->toDateTimeString(),
            ];
        }

        $this->cartRepo->updateCart($cart);
    }

    /**
     * カート詳細の取得（翻訳データと関税準備を含む）
     * @param string $locale
     * @return array
     */
    public function getCartDetails(string $locale): array
    {
        $cartItems = $this->cartRepo->getCart();
        if (empty($cartItems)) return [];

        $details = [];
        $totalPrice = 0;

        foreach ($cartItems as $key => $item) {
            // 商品とバリエーションを翻訳・画像込みで取得（論理削除されているものは取得されない）
            $product = Product::with([
                'translations' => fn($q) => $q->where('locale', $locale),
                'images',
                'category.translations' => fn($q) => $q->where('locale', $locale),
            ])->find($item['product_id']);

            if (!$product) continue;

            $variation = null;
            if ($item['variation_id']) {
                $variation = ProductVariant::with([
                    'translations' => fn($q) => $q->where('locale', $locale)
                ])->find($item['variation_id']);
            }

            $price = $variation ? $variation->price : $product->price;
            $subtotal = $price * $item['quantity'];
            $totalPrice += $subtotal;

            $details[] = [
                'cart_key' => $key,
                'product_id' => $product->id,
                'name' => $product->translations->first()?->name ?? $product->name_en,
                'variation_name' => $variation?->translations->first()?->name,
                'price' => (int)$price,
                'quantity' => (int)$item['quantity'],
                'subtotal' => (int)$subtotal,
                'image' => $product->images->where('is_primary', 1)->first()?->url ?? $product->images->first()?->url,
            ];
        }

        // ここに将来的な関税計算ロジックを差し込む余白
        // $customsFee = $this->calculateCustoms($totalPrice, $targetCountryId);

        return [
            'items' => $details,
            'total_price' => $totalPrice,
            'tax_estimate' => 0, // 将来の関税/消費税用
        ];
    }

    /**
     * カート内の商品を更新
     * @param string $key
     * @param int $quantity
     * @return void
     */
    private function generateKey($pId, $vId): string
    {
        return $vId ? "{$pId}-{$vId}" : (string)$pId;
    }

    /**
     * カート項目の数量を更新
     */
    public function updateItem(string $cartKey, int $quantity): void
    {
        $cart = $this->cartRepo->getCart();
        
        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] = $quantity;
            $this->cartRepo->updateCart($cart);
        }
    }

    /**
     * カートから項目を削除
     */
    public function removeItem(string $cartKey): void
    {
        $cart = $this->cartRepo->getCart();
        
        if (isset($cart[$cartKey])) {
            unset($cart[$cartKey]);
            $this->cartRepo->updateCart($cart);
        }
    }

    public function clearCart($fan): void
    {
        $this->cartRepo->clearCart($fan->id);
    }

    /**
     * 任意のカート内の商品を削除
     * @param array $keysToRemove
     */
    public function removeItemsFromSession(array $keysToRemove): void
    {
        $this->cartRepo->removeItems($keysToRemove);
    }
}