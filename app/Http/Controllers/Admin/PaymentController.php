<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Order;
use App\Models\InternationalShipping;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = DB::table('payments')
            ->leftJoin('international_shipping_payment', 'payments.id', '=', 'international_shipping_payment.payment_id')
            ->select([
                'payments.id',
                'payments.total_amount',
                'payments.status',
                'payments.external_transaction_id',
                'payments.created_at',
                'payments.order_id', // 1次決済用
                'international_shipping_payment.international_shipping_id as shipping_id', 
            ])
            ->orderBy('payments.created_at', 'desc')
            ->paginate(15);

        return \Inertia\Inertia::render('Admin/Payments/Index', [
            'payments' => $payments
        ]);
    }

    public function show($id)
    {
        // paymentBreakdown を Eager Load
        $payment = Payment::with('breakdowns')->findOrFail($id);

        $order = null;
        if ($payment->order_id) {
            $order = Order::with([
                'orderItems.product.translations' => function ($query) {
                    $query->where('locale', 'ja');
                },
                'orderItems.product.images',
                'orderItems.variation', // バリエーション情報
            ])->find($payment->order_id);
        }

        $shipping = null;
        $shippingRelation = DB::table('international_shipping_payment')
            ->where('payment_id', $id)
            ->first();

        if ($shippingRelation) {
            $shipping = InternationalShipping::with([
                'items.orderItem.product.translations' => function ($query) {
                    $query->where('locale', 'ja');
                },
                'items.orderItem.product.images',
                'items.orderItem.variation', // バリエーション情報
                'fan'
            ])->find($shippingRelation->international_shipping_id);
        }

        return \Inertia\Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
            'order' => $order,
            'shipping' => $shipping,
        ]);
    }
}