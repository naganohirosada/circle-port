<?php
namespace App\Services\Fan;

use App\Repositories\Interfaces\OrderRepositoryInterface;

class OrderService {
    protected $orderRepo;

    public function __construct(OrderRepositoryInterface $orderRepo) {
        $this->orderRepo = $orderRepo;
    }

    public function getOrderHistory($fan) {
        $userLocale = $fan->language_code;
        $orders = $this->orderRepo->getPaginatedForFan($fan->id);

        $statusMap = [
            10 => 'pending',
            20 => 'paid',
            30 => 'shipped_to_warehouse',
            40 => 'arrived_at_warehouse',
            50 => 'completed',
            90 => 'cancelled',
        ];

        // Paginatorの through メソッドを使うとスッキリ書けます
        return $orders->through(function ($order) use ($userLocale, $statusMap) {
            $order->status_key = $statusMap[$order->status] ?? 'pending';
            $order->orderItems->each(function ($item) use ($userLocale) {
                $item->display_image = $this->resolveDisplayImage($item->product);
                $item->display_product_name = $this->resolveTranslation($item->product, $userLocale);
                
                // バリエーション名の解決
                if ($item->variation) {
                    $item->display_variation_name = $this->resolveTranslation($item->variation, $userLocale) 
                        ?: $item->display_product_name;
                } else {
                    $item->display_variation_name = $item->display_product_name;
                }
            });
            return $order;
        });
    }

    private function resolveDisplayImage($product) {
        $image = $product->images->where('is_primary', 1)->first() ?? $product->images->first();
        if (!$image) return null;
        return $image->image_url ?: asset('storage/' . $image->file_path);
    }

    private function resolveTranslation($model, $locale) {
        $trans = $model->translations->where('locale', $locale)->first() ?? $model->translations->first();
        return $trans ? $trans->name : '---';
    }

    public function formatOrder($order, $userLocale)
    {
        // orderItemsのリレーション名を考慮（存在を確認してループ）
        $items = $order->orderItems ?? $order->order_items;
        
        if ($items) {
            $items->each(function ($item) use ($userLocale) {
                // 画像の解決
                $primaryImage = $item->product->images->where('is_primary', 1)->first() 
                                ?? $item->product->images->first();
                
                $item->display_image = $primaryImage 
                    ? ($primaryImage->image_url ?: asset('storage/' . $primaryImage->file_path)) 
                    : null;

                // 商品名の解決
                $pTrans = $item->product->translations->where('locale', $userLocale)->first() 
                        ?? $item->product->translations->first();
                $item->display_product_name = $pTrans ? $pTrans->name : '---';

                // バリエーション名の解決
                if ($item->variation) {
                    $vTrans = $item->variation->translations->where('locale', $userLocale)->first() 
                            ?? $item->variation->translations->first();
                    $item->display_variation_name = $vTrans ? $vTrans->name : $item->display_product_name;
                } else {
                    $item->display_variation_name = $item->display_product_name;
                }
            });
        }

        return $order;
    }
}